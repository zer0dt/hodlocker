'use client'

import React, { useEffect, useRef, useState } from 'react'

import HODLTransactions from '@/app/server-actions'
import { FaRegComment } from "react-icons/fa";
import { SiBitcoinsv } from "react-icons/si";

interface RepliesButtonProps {
    transaction: HODLTransactions
}

export default function RepliesButton({ transaction }: RepliesButtonProps) {

    const [replyDrawerVisible, setReplyDrawerVisible] = useState(false);
    const drawerRef = useRef(null);

    useEffect(() => {
        // Function to handle outside clicks
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setReplyDrawerVisible(false);
            }
        }

        // Add event listener when the component is mounted
        document.addEventListener("mousedown", handleClickOutside);

        // Remove event listener and class on cleanup
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);

        };
    }, [setReplyDrawerVisible, replyDrawerVisible]);

    return (
        <>
            <div
                className={`z-10 pointer-events-none fixed inset-0 bg-black duration-300 ${replyDrawerVisible ? 'opacity-30' : 'opacity-0'
                    }`}>
            </div>

            <div onClick={() => setReplyDrawerVisible(!replyDrawerVisible)} className="flex gap-1 mb-1">
                <FaRegComment className="reply-button mt-1 h-4 w-4" />
                <span className="text-sm font-medium font-mono">
                    {transaction.totalAmountandLockLikedForReplies
                        ? (transaction.totalAmountandLockLikedForReplies / 100000000).toFixed(2)
                        : null}
                </span>
                {transaction.totalAmountandLockLikedForReplies ? (
                    <SiBitcoinsv className="text-orange-400 h-4 w-4 mt-0.5" />
                ) : null}

            </div>
        </>

    )
}