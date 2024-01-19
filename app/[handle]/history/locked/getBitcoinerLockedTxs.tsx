import { cache } from 'react';
import { HODLBitcoiners, fetchCurrentBlockHeight } from '../../../server-actions';
import prisma from '../../../db';

export const dynamic = 'force-dynamic';

export const getBitcoinerLockedTxs = cache(async (handle: string): Promise<HODLBitcoiners> => {
  const currentBlockHeight = await fetchCurrentBlockHeight();

  const bitcoiner = await prisma.bitcoiner.findUnique({
    where: {
      handle,
    },
    select: {
      handle: true,
      created_at: true,
      transactions: {
        where: {
          locked_until: {
            gte: currentBlockHeight,
          },
        },
        select: {
          txid: true,
          amount: true,
          locked_until: true,
          created_at: true,
        },
        orderBy: {
          locked_until: 'asc', // Use 'desc' for descending order
        },
      },
      locklikes: {
        where: {
          locked_until: {
            gte: currentBlockHeight,
          },
        },
        select: {
          txid: true,
          amount: true,
          locked_until: true,
          created_at: true,
          post_id: true,
        },
        orderBy: {
          locked_until: 'asc', // Use 'desc' for descending order
        },
      },
    },
  });

  if (!bitcoiner) {
    throw new Error(`Bitcoiner with handle ${handle} not found.`);
  }

  const totalLockedFromTransactions = bitcoiner.transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const totalLockedFromLockLikes = bitcoiner.locklikes.reduce(
    (total, locklike) => total + locklike.amount,
    0
  );

  const totalAmountandLockLiked = (totalLockedFromTransactions + totalLockedFromLockLikes) / 100000000;

  return {
    ...bitcoiner,
    totalLockedFromTransactions: totalLockedFromTransactions / 100000000,
    totalLockedFromLockLikes: totalLockedFromLockLikes / 100000000,
    totalAmountandLockLiked: totalAmountandLockLiked
  };
});


