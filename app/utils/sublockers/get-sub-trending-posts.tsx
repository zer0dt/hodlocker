import { cache } from "react";
import prisma from "../../db";
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLTransactions, postLockLike } from "../../server-actions";
import PostComponent from "../../components/posts/PostComponent";
import ReplyComponent from "../../components/posts/replies/ReplyComponent";

export const dynamic = "force-dynamic";

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

export async function fetchTransactions(
  sub: string,
  sort: string,
  filter: number,
  page: number,
  limit: number
): Promise<HODLTransactions[]> {
  "use server";

  const currentBlockHeight = await fetchCurrentBlockHeight();
  console.log("getting the " + sub + "'s sublocker trending posts")

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
        post: {
            tags: {
              some: {
                name: sub, // Filter locklikes with the specified tag name
              },
            },
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
                  select: {
                    tags: true,  // Include tags for the transactions associated with the replies
                  },
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
        replies: {
          include: {
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
    });

    const seenTxids = new Set();
    const enrichedItems = [];

    for (const locklike of recentLocklikes) {
      const item = locklike.post || locklike.replies;
      if (!item || seenTxids.has(item.txid)) continue;

      seenTxids.add(item.txid);
      enrichedItems.push(enrichItem(item));
    }

    
    console.log("finished getting the " + sub + "'s sublockers trending " + enrichedItems.length + " posts and replies (remove replies from trending?)")
    return enrichedItems;
  } catch (error) {
    console.error(
      "Error fetching locklikes and their associated items:",
      error
    );
    throw error;
  }
}

export const getSubTrendingPosts = cache(
  async (sub: string, sort: string, filter: number, page: number, limit: number): Promise<JSX.Element> => {
    const items = await fetchTransactions(sub, sort, filter, page, limit);

    return (
      <>
        {items.filter(Boolean).map((item) => {

          if (item) {
            if ("post_id" in item) {
             
              return (
                <ReplyComponent
                  key={item.txid}
                  reply={item}
                  postLockLike={postLockLike}
                />
              );
            } else {
              
              return (
                <PostComponent
                  key={item.txid}
                  transaction={item}
                  postLockLike={postLockLike}
                />
              );
            }
          }
        })}
      </>
    );
  }
);
