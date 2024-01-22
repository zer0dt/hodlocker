import { cache } from 'react'
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { HODLBitcoiners } from '../../../server-actions'
import prisma from '../../../db';

export const dynamic = 'force-dynamic'

export const getBitcoinerUnlockables = cache(async (handle: string): Promise<HODLBitcoiners> => {
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
            lt: currentBlockHeight,
          },
        },
        select: {
          txid: true,
          amount: true,
          locked_until: true,
          created_at: true,
        },
      },
      locklikes: {
        where: {
          locked_until: {
            lt: currentBlockHeight,
          },
        },
        select: {
          txid: true,
          amount: true,
          locked_until: true,
          created_at: true,
          post_id: true,
        },
      },
      spent_tx: true, // Fetching spent transactions
    },
  });

  if (!bitcoiner) {
    throw new Error(`Bitcoiner with handle ${handle} not found.`);
  }

  // Check if transactions and locklikes are spent
  const spentTxIds = new Set(bitcoiner.spent_tx.map(tx => tx.txid));
  bitcoiner.transactions = bitcoiner.transactions.filter(tx => !spentTxIds.has(tx.txid));
  bitcoiner.locklikes = bitcoiner.locklikes.filter(locklike => !spentTxIds.has(locklike.txid));

  return {
    ...bitcoiner
  };
});

