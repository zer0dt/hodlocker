import { cache } from 'react';
import prisma from '../../db';
import { fetchCurrentBlockHeight } from '../../server-actions';


export const getAllTags = cache(async (type: string) => {    
  const currentBlockHeight = await fetchCurrentBlockHeight();

  const tags = await prisma.tag.findMany({
    where: {
      type: type, // Add this line to filter tags by the passed type
    },
    include: {
      _count: {
        select: {
          transactions: true
        },
      },
      transactions: {
        select: {
          locklikes: {
            where: {
              locked_until: {
                gte: currentBlockHeight,
              },
            },
            select: {
              amount: true,
            },
          },
          replies: {
            select: {
              locklikes: {
                where: {
                  locked_until: {
                    gte: currentBlockHeight,
                  },
                },
                select: {
                  amount: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Iterate over each tag to calculate the total amount locked
  tags.forEach(tag => {
    let totalAmountLocked = 0;

    // Sum amounts in transactions
    tag.transactions.forEach(transaction => {
      totalAmountLocked += transaction.locklikes.reduce((sum, locklike) => sum + locklike.amount, 0);

      // Sum amounts in replies
      transaction.replies.forEach(reply => {
        totalAmountLocked += reply.locklikes.reduce((sum, locklike) => sum + locklike.amount, 0);
      });
    });

    // Add the total amount locked to the tag object
    tag.totalAmountLocked = totalAmountLocked;
  });

  return tags;
});
