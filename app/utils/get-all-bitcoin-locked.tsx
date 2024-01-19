import { cache } from 'react'
import { fetchCurrentBlockHeight } from '../server-actions'
import prisma from '../db';
 
export const dynamic = 'force-dynamic'

export const getAllBitcoinLocked = cache(async (): Promise<number> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();
  
    const bitcoiners = await prisma.bitcoiner.findMany({
        include: {
            transactions: {
                where: {
                    locked_until: {
                        gte: currentBlockHeight,
                    },
                },
                select: {
                    amount: true,
                },
            },
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
                where: {
                    locked_until: {
                        gte: currentBlockHeight,
                    },
                },
                select: {
                    amount: true
                },
            },
        },
    });

    let totalLockedBitcoin = 0;

    bitcoiners.forEach(bitcoiner => {
        const totalLockedFromTransactions = bitcoiner.transactions.reduce((total, transaction) => total + transaction.amount, 0);
        const totalLockedFromLockLikes = bitcoiner.locklikes.reduce((total, locklike) => total + locklike.amount, 0);
        const totalLockedFromReplies = bitcoiner.replies.reduce((total, reply) => total + reply.amount, 0);

        const totalLockedForBitcoiner = (totalLockedFromTransactions + totalLockedFromLockLikes + totalLockedFromReplies) / 100000000;
        totalLockedBitcoin += totalLockedForBitcoiner;
    });

    return totalLockedBitcoin;
  });



