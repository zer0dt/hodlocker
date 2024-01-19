import { cache } from 'react'
import { fetchCurrentBlockHeight, postLockLike } from '../../server-actions'
import prisma from '../../db';
import NFTPostComponent from '../../components/feeds/nfts-(not-used)/NFTPostComponent';
 
export const dynamic = 'force-dynamic'


export const getNFTPosts =cache(async(
  sort: string,
  filter: number,
  page: number, 
  limit: number): Promise<JSX.Element[]> => {
  const currentBlockHeight = await fetchCurrentBlockHeight();
  const skip = (page - 1) * limit
    
 
      const NFTPosts = await prisma.nFTPosts.findMany({
          where: {
            locklikes: {
              some: {
                locked_until: {
                  gte: currentBlockHeight,
                },
              },
            },
          },
          include: {
            locklikes: {
              where: {
                locked_until: {
                  gte: currentBlockHeight,
                },
              },
              select: {
                amount: true,
                locked_until: true,
                handle_id: true,
                created_at: true,
                txid: true,
                nftpost_id: true                 
              },
            },
            replies: {
              include: {
                locklikes: true, // Include locklikes for replies
              },
            },
          },
        });
  
      const enrichedNFTPosts = NFTPosts.map((post) => {
      const totalLockLiked = post.locklikes.reduce(
          (sum, locklike) => sum + locklike.amount,
          0
      );
      const totalAmountandLockLiked = totalLockLiked + post.amount;
  
      // Calculate the total amount including locklikes for each reply
      const repliesWithTotalAmount = post.replies.map((reply) => ({
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
          ...post,
          totalLockLiked,
          totalAmountandLockLiked,
          totalAmountandLockLikedForReplies
      };
      });
  
      // Sort the transactions by totalAmountandLockLiked before applying skip and limit
      enrichedNFTPosts.sort((a, b) => b.totalAmountandLockLiked - a.totalAmountandLockLiked);
  
      // Apply offset and limit to the sorted transactions
      const paginatedPosts = enrichedNFTPosts.slice(skip, skip + limit);
  
      const renderPosts = paginatedPosts.map((post) => (
      <NFTPostComponent
          key={post.txid} // Assuming transaction has an 'id' field
          post={post}
          postLockLike={postLockLike}
      />
      ));
  
      return renderPosts;
  
})