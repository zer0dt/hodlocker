import { cache } from 'react'
import { HODLBitcoiners, fetchCurrentBlockHeight } from '../server-actions'
import prisma from '../db';
 

export const getBitcoinersforLocked = cache(async (): Promise<HODLBitcoiners[]> => {
  const currentBlockHeight = await fetchCurrentBlockHeight();

  console.log("getting 'locked' leaderboard: how much bitcoiners have locked themselves")

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
          amount: true,
        },
      },
    },
  });

  const bitcoinersWithTotalLocked = bitcoiners.map((bitcoiner) => {
    const totalLockedFromTransactions = bitcoiner.transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    const totalLockedFromLockLikes = bitcoiner.locklikes.reduce(
      (total, locklike) => total + locklike.amount,
      0
    );

    const totalLockedFromReplies = bitcoiner.replies.reduce(
      (total, reply) => total + reply.amount,
      0
    );

    const totalAmountLocked =
      (totalLockedFromTransactions + totalLockedFromLockLikes + totalLockedFromReplies) / 100000000;

    return {
      ...bitcoiner,
      totalAmountLocked: totalAmountLocked,
    };
  });

  // Filter out Bitcoiners with 0 total Bitcoin locked
  const filteredBitcoiners = bitcoinersWithTotalLocked.filter(
    (bitcoiner) => bitcoiner.totalAmountLocked !== 0
  );

  filteredBitcoiners.sort((a, b) => {
    // Sort based on the "totalAmountLocked" variable
    return b.totalAmountLocked - a.totalAmountLocked;
  });

  console.log("finished getting 'locked' leaderboard: " + filteredBitcoiners.length + " bitcoiners")
  return filteredBitcoiners;
});


export const getBitcoinersforLiked =cache(async(): Promise<HODLBitcoiners[]> => {
  const currentBlockHeight = await fetchCurrentBlockHeight();

  console.log("getting 'liked' leaderboard: how much bitcoiners have had locked to their posts")

  const bitcoiners = await prisma.bitcoiner.findMany({
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
                handle_id: true
              },
            },
            // Add other transaction properties as needed
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
                handle_id: true
              },
            },
            // Add other reply properties as needed
          },
        },
      },
    });


  const bitcoinersWithTotalLocked = bitcoiners.map((bitcoiner) => {      

      const totalLockLikedFromTransactions = bitcoiner.transactions.reduce(
          (total, transaction) => {
            const locklikesFromTransactions = transaction.locklikes || [];
            const locklikesFromOtherBitcoiners = locklikesFromTransactions.filter(
              (locklike) => locklike.handle_id !== bitcoiner.handle
            );
        
            return (
              total +
              locklikesFromOtherBitcoiners.reduce(
                (locklikeTotal, locklike) => locklikeTotal + locklike.amount,
                0
              )
            );
          },
          0
        );

        const totalLockLikedFromReplies = bitcoiner.replies.reduce(
          (total, reply) => {
            const locklikesFromReplies = reply.locklikes || [];
            const locklikesFromOtherBitcoiners = locklikesFromReplies.filter(
              (locklike) => locklike.handle_id !== bitcoiner.handle
            );
        
            return (
              total +
              locklikesFromOtherBitcoiners.reduce(
                (locklikeTotal, locklike) => locklikeTotal + locklike.amount,
                0
              )
            );
          },
          0
        );

      const totalLockLikedFromOthers = (totalLockLikedFromTransactions + totalLockLikedFromReplies)  / 100000000

      // Add the bitcoin_locked property to the bitcoiner object
      return {
      ...bitcoiner,
      totalLockLikedFromOthers: totalLockLikedFromOthers
      };
  });

  // Filter out Bitcoiners with the handle "anon" and those with 0 total Bitcoin locked
  const filteredBitcoiners = bitcoinersWithTotalLocked.filter(
    (bitcoiner) => bitcoiner.handle !== "anon" && bitcoiner.totalLockLikedFromOthers !== 0
  );  

  filteredBitcoiners.sort((a, b) => b.totalLockLikedFromOthers - a.totalLockLikedFromOthers);

  console.log("finished getting 'locked' leaderboard: " + filteredBitcoiners.length + " bitcoiners")
  return filteredBitcoiners;
})


export const getBitcoinerLikedData = async (bitcoinerHandle: string): Promise<HODLBitcoiners | null> => {
  const currentBlockHeight = await fetchCurrentBlockHeight();

  console.log("getting 'total liked' data for avatar ring:", bitcoinerHandle);

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
};


