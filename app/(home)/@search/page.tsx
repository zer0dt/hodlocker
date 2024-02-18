import React, { Suspense } from "react";

import { unstable_cache } from 'next/cache';
import { parse, stringify } from "superjson";

import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLTransactions, postLockLike } from "@/app/server-actions";
import prisma from "@/app/db";
import { Prisma } from '@prisma/client'
import PostComponent from "@/app/components/posts/PostComponent";
import Pagination from "@/app/components/feeds/sorting-utils/Pagination";

import PostComponentPlaceholder from '@/app/components/posts/placeholders/PostComponentPlaceholder'
import type { RankedBitcoiners } from "@/app/api/bitcoiners/route";
import Search from "./search";

export const getSearchPosts = (
    async (
        search: string,
        sort: string,
        filter: number,
        filter2: number,
        page: number,
        limit: number
    ): Promise<[]> => {
        console.log("getting search posts")
        const currentBlockHeight = await fetchCurrentBlockHeight();

        const skip = (page - 1) * limit;

        const currentDate = new Date();
        const currentTimestamp = currentDate.getTime(); // Get the current timestamp in milliseconds

        let yourEndTime = new Date(currentTimestamp); // Convert the current timestamp to a Date object
        let yourStartTime;

        // Determine the start time based on the 'sort' parameter
        if (sort === "day") {
            yourStartTime = new Date(currentTimestamp - 24 * 60 * 60 * 1000); // Subtract 24 hours in milliseconds
        } else if (sort === "week") {
            yourStartTime = new Date(currentTimestamp - 7 * 24 * 60 * 60 * 1000); // Subtract 7 days in milliseconds
        } else if (sort === "month") {
            yourStartTime = new Date(currentTimestamp - 30 * 24 * 60 * 60 * 1000); // Subtract 30 days in milliseconds (approximate)
        } else if (sort === "year") {
            yourStartTime = new Date(currentTimestamp - 365 * 24 * 60 * 60 * 1000); // Subtract 365 days in milliseconds (approximate)
        }

        const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'
        let handles: string[] = [];
        if (filter2 > 0) {
            const response = await fetch(`${baseUrl}/api/bitcoiners/`)
            if (response.ok) {
                const bitcoiners = (await response.json()).rankedBitcoiners as RankedBitcoiners
                handles = bitcoiners.filter(b => b.totalAmountLocked >= filter2).map(b => b.handle)
            }
        }

        try {
            const transactions = await prisma.transactions.findMany({
                where: {
                    AND: [
                        {
                            created_at: {
                                gte: yourStartTime,
                                lte: yourEndTime,
                            },
                        },
                        {
                            locklikes: {
                                some: {
                                    locked_until: { gte: currentBlockHeight },
                                },
                            },
                        },
                        (filter2 > 0 ? { handle_id: { in: handles } } : {}),
                        {
                            OR: [
                                {
                                    note: {
                                        contains: search,
                                        mode: Prisma.QueryMode.insensitive
                                    }

                                },
                                filter === 0 ? { locklikes: { none: {} } } : {}
                            ],

                        },
                    ],
                },
                orderBy: { created_at: "desc" },
                include: {
                    tags: true,
                    link: {
                        select: {
                            twitterId: true,
                            avatar: true
                        }
                    },
                    locklikes: {
                        where: { locked_until: { gt: currentBlockHeight } },
                        select: {
                            amount: true,
                            locked_until: true,
                            handle_id: true,
                            created_at: true,
                            txid: true,
                            post_id: true,
                            reply_txid: true,
                        },
                    },
                    replies: {
                        include: {
                            locklikes: true,
                            transaction: {
                                select: { tags: true, link: true },
                            },
                        },
                    },
                },
            });

            const enrichedTransactions = transactions.map((transaction) => {
                const totalLockLiked = transaction.locklikes.reduce(
                    (sum, locklike) => sum + locklike.amount,
                    0
                );
                const totalAmountandLockLiked = totalLockLiked + transaction.amount;

                // Calculate the total amount including locklikes for each reply
                const repliesWithTotalAmount = transaction.replies.map((reply) => {
                    // Remove 'data:image' and everything after it using regex
                    const filteredNote = reply.note.split('data:image')[0];

                    reply.note = filteredNote

                    // Return a new object with the filtered note and other properties
                    return {
                        ...reply,
                        totalAmountandLockLiked: reply.locklikes.reduce(
                            (total, locklike) => total + locklike.amount,
                            reply.amount
                        )
                    };
                });

                // Calculate the totalAmountandLockLikedFromReplies
                const totalAmountandLockLikedForReplies = repliesWithTotalAmount.reduce(
                    (sum, reply) => sum + (reply.totalAmountandLockLiked || 0),
                    0
                );

                // Remove 'data:image' and everything after it using regex
                const filteredNote = transaction.note.split('data:image')[0];

                transaction.note = filteredNote;

                // Check if the processed note contains the search query
                const noteContainsSearch = filteredNote.toLowerCase().includes(search.toLowerCase());

                return noteContainsSearch ? {
                    ...transaction,
                    totalLockLiked,
                    totalAmountandLockLiked,
                    totalAmountandLockLikedForReplies,
                    replies: repliesWithTotalAmount
                } : null;
            }).filter((enrichedTransaction) => enrichedTransaction !== null);

            // Sort the transactions by totalAmountandLockLiked before applying skip and limit
            enrichedTransactions.sort((a, b) => b.totalAmountandLockLiked - a.totalAmountandLockLiked);

            // Apply offset and limit to the sorted transactions
            const paginatedTransactions = enrichedTransactions.slice(skip, skip + limit);

            console.log("finished getting search `" + search + "` " + paginatedTransactions.length + " posts")
            return paginatedTransactions;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error;
        }
    }
);


interface SearchFeedProps {
    searchParams: {
        search: string,
        tab: string,
        sort: string,
        filter: string,
        filter2: string,
        page: number,
        limit: number
    }
}

const getCachedPosts = unstable_cache(
    async (search: string, sort: string, filter: number, filter2: number, currentPage: number, limit: number) => {
        const cachedPosts = await getSearchPosts(search, sort, filter, filter2, currentPage, limit)

        return stringify({ ...cachedPosts })
    },
    ['search-posts'],
    {
        tags: ['search', 'posts'], // Cache tags for invalidation
        revalidate: 60, // Revalidation time in seconds (e.g., 1 hour)
    }
);

export default async function SearchFeed({ searchParams }: SearchFeedProps) {

    const activeQuery = searchParams.search || null

    const activeTab = searchParams.tab || "trending"

    const activeSort = searchParams.sort || "year";

    const activeFilter = searchParams.filter !== undefined ? parseFloat(searchParams.filter) : 0;

    const activeFilter2 = searchParams.filter2 !== undefined ? parseFloat(searchParams.filter2) : 0;

    const currentPage = searchParams.page || 1;

    if (activeTab !== "search") {
        return null; // Don't render anything if activeTab is not "search"
    }

    let posts: HODLTransactions[] = [];

    if (activeQuery) { // Check if activeQuery is truthy
        const searchPosts = await getCachedPosts(activeQuery, activeSort, activeFilter, activeFilter2, currentPage, 30)

        const jsonPosts = JSON.stringify(searchPosts, null, 2);
        const sizeInBytes = new Blob([jsonPosts]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024); // Convert bytes to MB
        console.log("Size of searchPosts:", sizeInMB.toFixed(2), "MB");

        posts = parse<HODLTransactions[]>(searchPosts);
    }

    return (
        <>
            <div
                key={"search" + activeSort + activeFilter + activeFilter2 + currentPage}
                className="grid grid-cols-1 gap-0 w-full lg:w-96 pb-24"
            >
                <Search searchParams={searchParams} />
                {
                    Object.values(posts).map((transaction: HODLTransactions) => (
                        <Suspense key={transaction.txid} fallback={<PostComponentPlaceholder />}>
                            <PostComponent
                                key={transaction.txid} // Assuming transaction has an 'id' field
                                transaction={transaction}
                                postLockLike={postLockLike}
                            />
                        </Suspense>

                    ))
                }
                {activeQuery && posts.length > 0 &&
                    <Pagination tab={activeTab} currentPage={currentPage} sort={activeSort} filter={activeFilter} filter2={activeFilter2} />}
            </div>
        </>
    );


}
