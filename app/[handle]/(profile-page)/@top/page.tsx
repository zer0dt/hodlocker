
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLTransactions, postLockLike } from "@/app/server-actions";
import prisma from "@/app/db";
import PostComponent from "@/app/components/posts/PostComponent";

export const dynamic = "force-dynamic";

export const getBitcoinerTopPosts = (
  async (
    handle: string,
    page: number,
    limit: number
  ): Promise<JSX.Element[]> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();

    console.log("getting " + handle + "'s top posts")

    const skip = (page - 1) * limit

    try {
      const transactions = await prisma.transactions.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  locked_until: {
                    gte: currentBlockHeight,
                  },
                },
                {
                  locklikes: {
                    some: {
                      locked_until: {
                        gte: currentBlockHeight,
                      },
                    },
                  },
                },
                {
                  replies: {
                    some: {
                      locklikes: {
                        some: {
                          locked_until: {
                            gte: currentBlockHeight,
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
            {
              handle_id: handle,
            },
          ],
        },
        skip: skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          tags: true,
          locklikes: {
            where: {
              AND: [
                {
                  locked_until: {
                    gte: currentBlockHeight,
                  },
                },
              ],
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
              transaction: {
                include: {
                  tags: true,
                  link: true // Include the associated Bitcoiner for the original transaction
                }
              },
              locklikes: true,
               // Include locklikes for replies
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


      const renderTransactions = enrichedTransactions.map(
        (transaction: HODLTransactions, index: number) => (
          <PostComponent
            key={transaction.txid}
            transaction={transaction}
            postLockLike={postLockLike}
          />
        )
      );

      console.log("finished getting " + handle + "'s top posts")
      return renderTransactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  }
);


interface BitcoinerTopFeedProps {
  searchParams: {
      tab: string,
      sort: string,
      filter: string,
      page: number,
      limit: number
  }
}

export default async function BitcoinerTopFeed({ searchParams }: BitcoinerTopFeedProps) {
