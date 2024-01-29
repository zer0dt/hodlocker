import { cache } from 'react'
import { HODLBitcoiners } from '@/app/server-actions'
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import prisma from '@/app/db';

export const revalidate = 300

export const getBitcoinerLikedData = cache(async (bitcoinerHandle: string): Promise<HODLBitcoiners | null> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();
  
    const bitcoiner = await prisma.bitcoiner.findUnique({
      where: {
        handle: bitcoinerHandle,
      },
      include: {
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
                handle_id: true,
              },
            },
          },
        },
        replies: {
          select: {
            txid: true,
            amount: true,
            locked_until: true,
            created_at: true,
            locklikes: {
              where: {
                locked_until: {
                  gte: currentBlockHeight,
                },
              },
              select: {
                amount: true,
                handle_id: true,
              },
            },
          },
        },
      },
    });
  
    if (!bitcoiner) {
      console.log("Bitcoiner not found");
      return null;
    }
  
    // Calculation logic remains the same, just for the single bitcoiner
    const totalLockLikedFromTransactions = bitcoiner.transactions.reduce((total, transaction) => {
      const locklikes = transaction.locklikes || [];
      const filteredLocklikes = locklikes.filter(locklike => locklike.handle_id !== bitcoiner.handle);
      return total + filteredLocklikes.reduce((sum, locklike) => sum + locklike.amount, 0);
    }, 0);
  
    const totalLockLikedFromReplies = bitcoiner.replies.reduce((total, reply) => {
      const locklikes = reply.locklikes || [];
      const filteredLocklikes = locklikes.filter(locklike => locklike.handle_id !== bitcoiner.handle);
      return total + filteredLocklikes.reduce((sum, locklike) => sum + locklike.amount, 0);
    }, 0);
  
    const totalLockLikedFromOthers = (totalLockLikedFromTransactions + totalLockLikedFromReplies) / 100000000;
  
    return {
      ...bitcoiner,
      totalLockLikedFromOthers,
    };
  });
  
  
  