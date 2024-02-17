import { cache } from "react";
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLTransactions, postLockLike } from "../../server-actions";
import prisma from "../../db";
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
    // Calculate the total amount including locklikes for each reply
    const repliesWithTotalAmount = (item.replies || []).map((reply) => {
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

    const totalAmountandLockLikedForReplies = repliesWithTotalAmount.reduce(
      (sum, reply) => sum + (reply.totalAmountandLockLiked || 0),
      0
    );

    // Remove 'data:image' and everything after it using regex
    const filteredNote = item.note.split('data:image')[0];

    item.note = filteredNote;

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
            link: {
              select: {
                twitterId: true
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
            replies: {
              include: {
                transaction: {
                  select: {
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

    const jsonPosts = JSON.stringify(items, null, 2);
    const sizeInBytes = new Blob([jsonPosts]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024); // Convert bytes to MB
    console.log("Size of bitcoinerLockedToPosts:", sizeInMB.toFixed(2), "MB");

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
