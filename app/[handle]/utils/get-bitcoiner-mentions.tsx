import { cache } from "react";
import {
  HODLTransactions,
  fetchCurrentBlockHeight,
  postLockLike,
} from "../../server-actions";
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
                    include: {
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

      // Sort the transactions by totalAmountandLockLiked in descending order
      enrichedTransactions.sort(
        (a, b) => b.totalAmountandLockLiked - a.totalAmountandLockLiked
      );

      // Apply skip and take after sorting
      const paginatedTransactions = enrichedTransactions.slice(
        skip,
        skip + limit
      );

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
