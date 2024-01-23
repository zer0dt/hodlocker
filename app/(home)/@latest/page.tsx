import React from "react";

import { cache } from "react";
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { postLockLike } from "@/app/server-actions";
import prisma from "@/app/db";
import PostComponent from "@/app/components/posts/PostComponent";
import Pagination from "@/app/components/feeds/sorting-utils/Pagination";


export const getLatestPosts = cache(
    async (
        sort: string,
        filter: number,
        page: number,
        limit: number
    ): Promise<[]> => {
        console.log("getting latest posts")
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
                            OR: [
                                {
                                    locklikes: {
                                        some: {
                                            AND: [
                                                {
                                                    locked_until: {
                                                        gt: currentBlockHeight,
                                                    },
                                                },
                                                {
                                                    amount: {
                                                        gte: filter * 100000000,
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                filter === 0 ? { locklikes: { none: {} } } : {},
                            ],
                        },
                    ],
                },
                skip: skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    tags: true,
                    locklikes: {
                        where: {
                            locked_until: {
                                gt: currentBlockHeight,
                            }
                        },
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
                                include: {
                                    tags: true,
                                    link: true // Include the associated Bitcoiner for the original transaction
                                }
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
                const repliesWithTotalAmount = transaction.replies.map((reply) => ({
                    ...reply,
                    totalAmountandLockLiked: reply.locklikes.reduce(
                        (total, locklike) => total + locklike.amount,
                        reply.amount
                    ),
                }));

                // Calculate the totalAmountandLockLikedFromReplies
                const totalAmountandLockLikedForReplies = repliesWithTotalAmount.reduce(
                    (sum, reply) => sum + (reply.totalAmountandLockLiked || 0),
                    0
                );

                return {
                    ...transaction,
                    totalLockLiked,
                    totalAmountandLockLiked,
                    totalAmountandLockLikedForReplies,
                    replies: repliesWithTotalAmount
                };
            });

            console.log("finished getting latest " + enrichedTransactions.length + " posts")
            return enrichedTransactions;
        } catch (error) {
            console.error("Error fetching transactions:", error);
            throw error;
        }
    }
);


interface LatestFeedProps {
    searchParams: {
        tab: string,
        sort: string,
        filter: string,
        page: number,
        limit: number
    }
}

export default async function LatestFeed({ searchParams }: LatestFeedProps) {

    const activeTab = searchParams.tab || "trending"

    const activeSort = searchParams.sort || "week";

    const activeFilter = searchParams.filter !== undefined ? parseFloat(searchParams.filter) : 0;

    const currentPage = searchParams.page || 1;

    if (activeTab == "latest") {
        const latestPosts = await getLatestPosts(activeSort, activeFilter, currentPage, 30)

        return (
            <div className="grid grid-cols-1 gap-0 w-full lg:w-96">
                {
                    latestPosts.map((transaction) => (
                        <PostComponent
                            key={transaction.txid} // Assuming transaction has an 'id' field
                            transaction={transaction}
                            postLockLike={postLockLike}
                        />
                    ))
                }
                <Pagination tab={activeTab} currentPage={currentPage} sort={activeSort} filter={activeFilter} />
            </div>
        )
    } else {
        return (
            null
        );
    }


}
