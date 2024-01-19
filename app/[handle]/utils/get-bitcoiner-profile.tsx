import { cache } from "react";
import { fetchCurrentBlockHeight } from "../../server-actions";
import prisma from "../../db";

export const dynamic = "force-dynamic";

export const getBitcoinerProfile = cache(
  async (
    handle: string
  ): Promise<{
    handle: string;
    created_at: Date;
    totalAmountandLockLiked: number;
  }> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();

    try {
      const bitcoiner = await prisma.bitcoiner.findUnique({
        where: {
          handle: handle,
        },
        select: {
          created_at: true,
          handle: true,
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
          transactions: {
            select: {
              amount: true,
            },
            where: {
              locked_until: {
                gte: currentBlockHeight,
              },
            },
          },
        },
      });

      if (!bitcoiner) {
        throw Error("No bitcoiner found")
      }

      const totalLockLikedFromBitcoiner = bitcoiner.locklikes.reduce(
        (sum, locklike) => sum + locklike.amount,
        0
      );
      const totalTransactionsAmount = bitcoiner.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      const totalAmountandLockLiked =
        totalTransactionsAmount + totalLockLikedFromBitcoiner;

      return {
        handle: bitcoiner.handle,
        created_at: bitcoiner.created_at,
        totalAmountandLockLiked,
      };
    } catch (error) {
      console.error("Error fetching Bitcoiner profile:", error);
      throw error;
    }
  }
);

export const getFollowersTotal = cache(
  async (handle: string): Promise<{ totalLocklikedFromAllBitcoiners: number, locklikedFromIndividualBitcoiners: Record<string, number> }> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();

    // Fetch locklikes where the post or reply was made by the provided handle
    const locklikes = await prisma.lockLikes.findMany({
      where: {
        OR: [
          {
            post: {
              handle_id: handle,
            },
          },
          {
            replies: {
              handle_id: handle,
            },
          },
        ],
        locked_until: {
          gt: currentBlockHeight,
        },
      },
      include: {
        post: true,
        replies: true,
      },
    });


    // Initialize variables
    let totalLocklikedFromAllBitcoiners = 0;
    const locklikedFromIndividualBitcoiners: Record<string, number> = {};

    // Calculate the total and individual locklikes
    locklikes.forEach((locklike) => {
      if (locklike.handle_id !== handle) {
        totalLocklikedFromAllBitcoiners += locklike.amount;

        // Update individual locklikes
        const bitcoinerHandle = locklike.handle_id;
        if (locklikedFromIndividualBitcoiners[bitcoinerHandle] === undefined) {
          locklikedFromIndividualBitcoiners[bitcoinerHandle] = locklike.amount;
        } else {
          locklikedFromIndividualBitcoiners[bitcoinerHandle] += locklike.amount;
        }
      }
    });

    return { totalLocklikedFromAllBitcoiners, locklikedFromIndividualBitcoiners };
  }
);


export const getFollowingTotal = cache(
  async (handle: string): Promise<{ totalLocklikesToOthers: number, locklikesToBitcoiners: Record<string, number> }> => {
    const currentBlockHeight = await fetchCurrentBlockHeight();

    // Use Prisma to query the locklikes model to get the locklikes done by the Bitcoiner.
    const locklikes = await prisma.lockLikes.findMany({
      where: {
        handle_id: handle, // Locklikes done by the Bitcoiner.
        locked_until: { gt: currentBlockHeight },
      },
      select: {
        amount: true,
        post: {
          select: {
            handle_id: true
          },
        },
        replies: {
          select: {
            handle_id: true
          },
        },
      },
    });

    // Calculate the total amount of locklikes given to others.
    let totalLocklikesToOthers = 0;

    // Calculate the total amount of locklikes given to each Bitcoiner.
    const locklikesToBitcoiners: Record<string, number> = {};

    locklikes.forEach((locklike) => {
      if (locklike.post && locklike.post.handle_id !== handle) {
        totalLocklikesToOthers += locklike.amount;

        const bitcoinerHandle = locklike.post.handle_id;
        locklikesToBitcoiners[bitcoinerHandle] = (locklikesToBitcoiners[bitcoinerHandle] || 0) + locklike.amount;
      }
      if (locklike.replies && locklike.replies.handle_id !== handle) {
        totalLocklikesToOthers += locklike.amount;

        const bitcoinerHandle = locklike.replies.handle_id;
        locklikesToBitcoiners[bitcoinerHandle] = (locklikesToBitcoiners[bitcoinerHandle] || 0) + locklike.amount;
      }
    });

    return { totalLocklikesToOthers, locklikesToBitcoiners };
  }
);




  
  
