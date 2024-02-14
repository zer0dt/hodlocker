import React, { Suspense } from 'react'

import PostComponent from "@/app/components/posts/PostComponent";
import PostComponentPlaceholder from '@/app/components/posts/placeholders/PostComponentPlaceholder'

import { HODLTransactions, postLockLike } from "@/app/server-actions";

interface LatestFeedPostsProps {
    posts: HODLTransactions[]
}

export default function LatestFeedPosts({ posts }: LatestFeedPostsProps) {
    return (
         
            Object.values(posts).map((transaction: HODLTransactions) => (
                <Suspense key={transaction.txid} fallback={<PostComponentPlaceholder />}>
                    <PostComponent
                        key={transaction.txid} // Assuming transaction has an 'id' field
                        transaction={transaction}
                        postLockLike={postLockLike}
                    />
                </Suspense>
            ))
        
    )
}