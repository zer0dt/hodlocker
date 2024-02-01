'use client'

import { useState } from "react";
import InfiniteScroll from 'react-infinite-scroller';
import Loading from "@/app/(home)/loading-spinner";
import { LockLikes } from "@prisma/client";
import { HODLTransactions } from "../../../server-actions";
import ReplyComponent from "../../posts/ReplyComponent";
import PostComponent from "../../posts/PostComponent";

interface LoadMoreProps { 
  fetchTransactions: (skip: number, limit: number) => Promise<HODLTransactions[]>; // Updated function signature
  postLockLike: (
    txid: string,
    amount: number,
    nLockTime: number,
    handle: string,
    postTxid?: string,
    replyTxid?: string
  ) => Promise<LockLikes>;
}

export default function LoadMore({ fetchTransactions, postLockLike }: LoadMoreProps) {
    const [transactions, setTransactions] = useState<HODLTransactions[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [skip, setSkip] = useState(0); // Initialized skip state
    const limit = 20; // Assuming a limit of 20, adjust as needed

    const loadTransactions = async () => {
        try {
            const newTransactions = await fetchTransactions(skip, limit);

            if (newTransactions.length === 0) {
                setHasMore(false);
            } else {
                setTransactions(prev => [...prev, ...newTransactions]);
                setSkip(prevSkip => prevSkip + limit); // Increase skip by the limit
            }
        } catch (error) {
            console.error('Error fetching more transactions:', error);
        }
    };

    return (
        <>
            <InfiniteScroll
                pageStart={0}
                loadMore={loadTransactions}
                hasMore={hasMore}
                loader={<div className="loader" key={0}><Loading /></div>}
            >  
                {transactions.map(transaction => {
                    if ('post_id' in transaction) {
                        return (
                            <ReplyComponent
                                key={transaction.txid}
                                reply={transaction}
                                postLockLike={postLockLike}
                            />
                        );
                    } else {
                        return (
                            <PostComponent
                                key={transaction.txid}
                                transaction={transaction}
                                postLockLike={postLockLike}
                            />
                        );
                    }                
                })}
            </InfiniteScroll>  
        </>
    );
}
