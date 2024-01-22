import { cache } from 'react'
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { postLockLike } from '@/app/server-actions'
import prisma from '@/app/db';
import PostComponent from '@/app/components/posts/PostComponent';



const getTopPosts = cache(async (sort: string, filter: number, page: number, limit: number): Promise<[]> => {
    console.log("getting top posts")
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
        const transactions = await prisma.transactions.findMany({
            where: {
                created_at: {
                    gte: yourStartTime,
                    lte: yourEndTime,
                },
            },
            include: {
                tags: true,
                locklikes: {
                    where: {
                        locked_until: {
                            gte: currentBlockHeight,
                        },
                        amount: {
                            gte: filter * 100000000, // Filter locklikes where the 'amount' is greater than or equal to the 'filter' amount
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
                        locklikes: true, // Include locklikes for replies
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

        // Sort the transactions by totalAmountandLockLiked before applying skip and limit
        enrichedTransactions.sort((a, b) => b.totalAmountandLockLiked - a.totalAmountandLockLiked);

        // Apply offset and limit to the sorted transactions
        const paginatedTransactions = enrichedTransactions.slice(skip, skip + limit);

        console.log("finished getting top " + paginatedTransactions.length + " posts")

        return paginatedTransactions;

    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
})

interface TopFeedProps {
    searchParams: {
        tab: string,
        sort: string,
        filter: string,
        page: number,
        limit: number
    }
}

export default async function TopFeed({ searchParams }: TopFeedProps) {

    const activeTab = searchParams.tab || "trending"

    const activeSort = searchParams.sort || "week";

    const activeFilter = searchParams.filter !== undefined ? parseFloat(searchParams.filter) : 0;

    const currentPage = searchParams.page || 1;

    if (activeTab == "top") {
        const topPosts = await getTopPosts(activeSort, activeFilter, currentPage, 30)

        return (
            <div className="grid grid-cols-1 gap-0 w-full lg:w-96 pb-20">
                {
                    topPosts.map((transaction) => (
                        <PostComponent
                            key={transaction.txid} // Assuming transaction has an 'id' field
                            transaction={transaction}
                            postLockLike={postLockLike}
                        />
                    ))
                }

            </div>
        )
    } else {
        return (
            null
        )
    }
}
