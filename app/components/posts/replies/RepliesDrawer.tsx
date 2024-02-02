'use client'

import React, { useEffect, useRef, useState } from "react";
import ReplyComponent from "./ReplyComponent";
import { LockLikes } from "@prisma/client";
import ReplyInteraction from "@/app/components/actions/ReplyInteraction";

import { FaRegComment } from "react-icons/fa";
import { SiBitcoinsv } from "react-icons/si";
import { HODLTransactions } from "@/app/server-actions";

import { usePathname } from 'next/navigation'
import { formatBitcoinValue } from "../posts-format";

interface RepliesDrawerProps {
  transaction: any,
  replies: any,
  postLockLike: (
    txid: string,
    amount: number,
    nLockTime: number,
    handle: string,
    postTxid?: string,
    replyTxid?: string
  ) => Promise<LockLikes>;
}

const RepliesDrawer = ({
  transaction,
  replies,
  postLockLike
}: RepliesDrawerProps) => {
  const pathname = usePathname()

  const [replyDrawerVisible, setReplyDrawerVisible] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    scrollBottom()
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

  const toggleReplyDrawer = () => {
    // Check if the pathname includes "post"
    if (!pathname.includes('post')) {
      setReplyDrawerVisible(!replyDrawerVisible);
    }
  };

  const scrollBottom = () => {
    if (replyDrawerVisible && drawerRef.current) {
      setTimeout(() => {
        drawerRef.current.scrollTo({
          top: drawerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 20); // Adjust the delay as needed
    }
  };

  return (
    <>

      <div
        className={`z-10 pointer-events-none fixed inset-0 bg-black duration-300 ${replyDrawerVisible ? 'opacity-30' : 'opacity-0'
          }`}>
      </div>

      <div onClick={toggleReplyDrawer} className="flex items-center gap-1 mb-1 cursor-pointer hover:text-orange-400">
        <FaRegComment className="reply-button h-4 w-4" />
        <span className="text-sm font-medium font-mono">
          {transaction.totalAmountandLockLikedForReplies
            ? formatBitcoinValue(transaction.totalAmountandLockLikedForReplies / 100000000)
            : null}
        </span>
        {transaction.totalAmountandLockLikedForReplies ? (
          <SiBitcoinsv className="text-orange-400 h-4 w-4 mt-0.5" />
        ) : null}

      </div>

      {replyDrawerVisible && (
        <div
          key={transaction.txid}
          id="comments-drawer"
          ref={drawerRef}
          className={`h-auto max-h-screen fixed z-10 rounded-lg fixed bottom-0 right-0 w-full lg:w-1/3 p-4 shadow-lg overflow-y-auto items-center transition-transform bg-white dark:bg-black ${replyDrawerVisible ? "transform-none" : "translate-y-full"
            }`}
          tabIndex={-1}
        >
          <div className="flex py-2 justify-center items-center">
            <h5
              id="drawer-bottom-label"
              className="inline-flex items-center mb-1 text-lg font-semibold text-black dark:text-white"
            >
              Comments
            </h5>
            <button
              onClick={() => setReplyDrawerVisible(!replyDrawerVisible)}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          {replies.map((reply: HODLTransactions, index: number) => (
            <div key={index}>
              <ReplyComponent reply={reply} postLockLike={postLockLike} />
            </div>
          ))}

          <div className="pt-4 pb-20 lg:pb-6">
            <ReplyInteraction transaction={transaction} />
          </div>

        </div>
      )}
    </>
  );
};

export default RepliesDrawer;
