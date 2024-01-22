
import { cache } from "react";
import prisma from "@/app/db";
import {
    HODLTransactions,
    fetchCurrentBlockHeight,
    postLockLike,
} from "@/app/server-actions";
import PostComponent from "@/app/components/posts/PostComponent";


function enrichItem(item: HODLTransactions): any {
    // Calculate the total amount lockliked to the post or reply
    const totalLockLiked = item.locklikes.reduce(
        (sum, locklike) => sum + locklike.amount,
        0
    );

    // Calculate the total amount and lockliked
    const totalAmountandLockLiked = item.amount + totalLockLiked;

    if ("post_id" in item) {
        // It's a reply
        return {
            ...item,
            totalLockLiked,
            totalAmountandLockLiked,
        };
    } else {
        // It's a transaction
        const repliesWithTotalAmount = (item.replies || []).map((reply) => ({
            ...reply,
            totalAmountandLockLiked: reply.locklikes.reduce(
                (total, locklike) => total + locklike.amount,
                reply.amount
            ),
        }));

        const totalAmountandLockLikedForReplies = repliesWithTotalAmount.reduce(
            (sum, reply) => sum + (reply.totalAmountandLockLiked || 0),
            0
        );

        return {
            ...item,
            totalLockLiked,
            totalAmountandLockLiked,
            totalAmountandLockLikedForReplies,
            replies: repliesWithTotalAmount,
        };
    }
}

async function fetchTransactions(
    sort: string,
    filter: number,
    page: number,
    limit: number
): Promise<HODLTransactions[]> {
    "use server";

    const currentBlockHeight = await fetchCurrentBlockHeight();

    const skip = (page - 1) * limit

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
        const recentLocklikes = await prisma.lockLikes.findMany({
            skip: skip,
            take: limit,
            orderBy: { created_at: "desc" },
            where: {
                locked_until: {
                    gt: currentBlockHeight,
                },
                created_at: {
                    gte: yourStartTime, // Adjust the start time as needed
                    lte: yourEndTime,   // Set yourEndTime to the current date
                },
                amount: {
                    gte: filter * 100000000, // Filter locklikes where the 'amount' is greater than or equal to the 'filter' amount
                },
            },
            include: {
                post: {
                    include: {
                        tags: true,
                        locklikes: {
                            orderBy: { created_at: "desc" },
                            where: {
                                locked_until: {
                                    gt: currentBlockHeight,
                                },
                            },
                        },
                        replies: {
                            include: {
                                transaction: {
                                    include: {
                                        tags: true,
                                        link: true // Include the associated Bitcoiner for the original transaction
                                    }
                                },
                                locklikes: {
                                    orderBy: { created_at: "desc" },
                                    where: {
                                        locked_until: {
                                            gt: currentBlockHeight,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const seenTxids = new Set();
        const enrichedItems = [];

        for (const locklike of recentLocklikes) {
            let item = locklike.post

            // Avoid processing the same transaction more than once
            if (!item || seenTxids.has(item.txid)) continue;

            seenTxids.add(item.txid);
            enrichedItems.push(enrichItem(item));
        }

        return enrichedItems;
    } catch (error) {
        console.error(
            "Error fetching locklikes and their associated items:",
            error
        );
        throw error;
    }
}

const getTrendingPosts = cache(
    async (sort: string, filter: number, page: number, limit: number): Promise<[]> => {
        console.log("getting trending posts")
        const items = await fetchTransactions(sort, filter, page, limit);
        console.log("finished getting " + items.length + " trending posts")
        return items
    }
);


interface TrendingFeedProps {
    searchParams: {
        tab: string,
        sort: string,
        filter: string,
        page: number,
        limit: number
    }
}

export default async function TrendingFeed({ searchParams }: TrendingFeedProps) {

    const activeTab = searchParams.tab || "trending"

    const activeSort = searchParams.sort || "week";

    const activeFilter = searchParams.filter !== undefined ? parseFloat(searchParams.filter) : 0;

    const currentPage = searchParams.page || 1;

    const trendingPosts = activeTab == "trending" ? await getTrendingPosts(activeSort, activeFilter, currentPage, 30) : null

    return (
        activeTab == "trending" ? 
        <div className="grid grid-cols-1 gap-0 w-full lg:w-96 pb-20">
            { trendingPosts ?
                trendingPosts.filter(Boolean).map((item) => {
                    return (
                        <PostComponent
                            key={item.txid}
                            transaction={item}
                            postLockLike={postLockLike}
                        />
                    );
                }) : null
            }
        </div> : null
    )
}
