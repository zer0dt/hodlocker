import { cache } from "react";
import {
  fetchCurrentBlockHeight,
  postLockLike,
} from "../../server-actions";
import prisma from "../../db";
import ReplyComponent from "../../components/posts/ReplyComponent";

export const dynamic = "force-dynamic";

export const getBitcoinerReplies = cache(
  async (
    handle: string,
    page: number,
    limit: number
  ): Promise<JSX.Element[]> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();

    console.log("getting " + handle + "'s replies")

    const skip = (page - 1) * limit

    try {
      const replies = await prisma.replies.findMany({
        where: {
          handle_id: handle,
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
          ],
        },
        skip: skip, // Skip a certain number of records
        take: limit, // Take a certain number of records
        include: {
          locklikes: true,
          transaction: {
            select: {
              tags: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
          

      const enrichedReplies = replies.map((reply) => {
        const totalLockLiked = reply.locklikes.reduce(
          (sum, locklike) => sum + locklike.amount,
          0
        );
        const totalAmountandLockLiked = totalLockLiked + reply.amount; 

        return {
          ...reply,          
          totalAmountandLockLiked
        };
      });
         

      const renderReplies = enrichedReplies.map(
        (reply, index: number) => (
          <ReplyComponent
            key={reply.txid}
            reply={reply}
            postLockLike={postLockLike}
          />
        )
      );

      console.log("finished getting " + handle + "'s replies")
      return renderReplies;
    } catch (error) {
      console.error("Error fetching replies:", error);
      throw error;
    }
  }
);

