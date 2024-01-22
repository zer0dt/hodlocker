import { cache } from "react";
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLTransactions, postLockLike } from "../../server-actions";
import prisma from "../../db";
import PostComponent from "../../components/posts/PostComponent";
import ReplyComponent from "../../components/posts/ReplyComponent";

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
    handle: string,
    page: number,
    limit: number
  ): Promise<HODLTransactions[]> {
    "use server";
  
    const currentBlockHeight = await fetchCurrentBlockHeight();
    console.log("getting " + handle + "'s locked to posts")
  
    const skip = (page - 1) * limit
  
    
    try {
      const recentLocklikes = await prisma.lockLikes.findMany({
        skip: skip,
        take: limit,
        orderBy: { created_at: "desc" },
        where: {
          locked_until: {
            gt: currentBlockHeight,
          },
          // Add this line to filter by the handle of the Bitcoiner
          link: {
            handle: handle,
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
      });
  
      const seenTxids = new Set();
      const enrichedItems = [];
  
      for (const locklike of recentLocklikes) {
        const item = locklike.post || locklike.replies;
        if (!item || seenTxids.has(item.txid)) continue;
  
        seenTxids.add(item.txid);
        enrichedItems.push(enrichItem(item));
      }
  
      console.log("finished getting " + handle + "'s locked to posts")
      return enrichedItems;
    } catch (error) {
      console.error(
        "Error fetching locklikes and their associated items:",
        error
      );
      throw error;
    }
  }

  export const getBitcoinerLocks = cache(
    async (handle: string, page: number, limit: number): Promise<JSX.Element> => {
      const items = await fetchTransactions(handle, page, limit);
  
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
