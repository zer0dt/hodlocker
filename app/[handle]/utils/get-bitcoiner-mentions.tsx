import { cache } from "react";
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLTransactions, postLockLike } from "../../server-actions";
import prisma from "../../db";
import PostComponent from "../../components/posts/PostComponent";

export const dynamic = "force-dynamic";

export const getBitcoinerMentions = cache(
  async (
    handle: string,
    page: number,
    limit: number
  ): Promise<JSX.Element[]> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();
    console.log("getting " + handle + "'s mentions")

    const skip = (page - 1) * limit

    try {
      const transactions = await prisma.transactions.findMany({
        where: {
          AND: [
            {
              note: {
                contains: `@${handle}`, // The handle of the Bitcoiner being mentioned
              },
            },
            {
              OR: [
                {
                  locklikes: {
                    some: {
                      locked_until: {
                        gt: currentBlockHeight
                      }
                    }
                  }
                },
                {
                  locked_until: {
                    gt: currentBlockHeight
                  }
                }
              ]
            }
          ],
        },
        include: {
          tags: true,
          locklikes: {
            where: {
              locked_until: {
                gt: currentBlockHeight
              }
            }
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
                where: {
                  locked_until: {
                    gt: currentBlockHeight
                  }
                }
              }
            }
          }
        }
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

        return {
          ...transaction,
          totalLockLiked,
          totalAmountandLockLiked,
          totalAmountandLockLikedForReplies,
          replies: repliesWithTotalAmount
        };
      });

      // Sort the transactions by totalAmountandLockLiked in descending order
      enrichedTransactions.sort(
        (a, b) => b.totalAmountandLockLiked - a.totalAmountandLockLiked
      );

      // Apply skip and take after sorting
      const paginatedTransactions = enrichedTransactions.slice(
        skip,
        skip + limit
      );

      const jsonPosts = JSON.stringify(paginatedTransactions, null, 2);
      const sizeInBytes = new Blob([jsonPosts]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024); // Convert bytes to MB
      console.log("Size of bitcoinerMentionedPosts:", sizeInMB.toFixed(2), "MB");

      const renderTransactions = paginatedTransactions.map(
        (transaction: HODLTransactions, index: number) => (
          <PostComponent
            key={transaction.txid}
            transaction={transaction}
            postLockLike={postLockLike}
          />
        )
      );

      console.log("finished getting " + handle + "'s mentions")
      return renderTransactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);
