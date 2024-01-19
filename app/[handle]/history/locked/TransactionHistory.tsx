
import React from "react";

import {
  HODLBitcoiners,
} from "../../../server-actions";

import LockedPosts from "./LockedPosts";
import LockedLockLikes from "./LockedLockLikes";
import Link from "next/link";
import { HiSwitchHorizontal } from "react-icons/hi";
import { SiBitcoinsv } from "react-icons/si";

interface HistoryProps {
  bitcoiner: HODLBitcoiners
  currentBlockHeight: number;
  handle: string;
  searchParams: {
    type: string
  };
}

const TransactionHistory = ({ bitcoiner, currentBlockHeight, handle, searchParams }: HistoryProps) => {

  const activeTab = searchParams.type || 'posts'

  const spinner = () => {
    return (
      <div className="text-center">
            <div role="status">
                <svg aria-hidden="true" className="mt-8 inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
      </div>
    )
  }  

  
  return (
    <div className="pb-24">
      <div className="pt-4 font-semibold text-right relative">
        <h1 className="text-3xl mb-2 text-l font-normal text-center pb-4">
          <span className="block">locked txs</span>
          <span className="flex justify-center block text-sm pt-2">Total Locked: {bitcoiner.totalAmountandLockLiked} <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" /></span>
          <span className="flex justify-center block text-sm pt-2">From Posts: {bitcoiner.totalLockedFromTransactions} <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" /></span>
          <span className="flex justify-center block text-sm pt-2">From Locks: {bitcoiner.totalLockedFromLockLikes} <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" /></span>
        </h1>
      </div>

      <div className="flex justify-between">
        <Link href={"/" + handle + "/history" + "/unlockable"}>
            <HiSwitchHorizontal className="pl-2 w-8 h-8" />
        </Link>
        <div className="flex pr-2 min-w-2/3">
          <Link href={"/" + handle + "/history" + "/locked?type=posts"}>
            <button
              className={`mr-4 py-1 focus:outline-none ${
                activeTab === "Posts"
                  ? "border-b-2 border-orange-400 font-semibold text-lg"
                  : ""
              }`}
            >
              posts
            </button>
          </Link>
          
          <Link href={"/" + handle + "/history" + "/locked?type=locks"}>
            <button
              className={`py-1 focus:outline-none ${
                activeTab === "LockLikes"
                  ? "border-b-2 border-orange-400 font-semibold text-lg"
                  : ""
              }`}
            >
              locks
            </button>
          </Link>
          
        </div>
      </div>

      { 
        currentBlockHeight === undefined ? (
          spinner()
        ) : (
          <>
            {activeTab === "posts" && bitcoiner.transactions.length === 0 ? (
              <p className="px-8 py-8"><b>No Locked Posts</b></p>
            ) : (
              activeTab === "posts" && (
                <LockedPosts lockedPosts={bitcoiner.transactions} currentBlockHeight={currentBlockHeight} />
              )
            )}

            {activeTab === "locks" && bitcoiner.locklikes.length === 0 ? (
              <p className="px-8 py-8"><b>No Locked Likes</b></p>
            ) : (
              activeTab === "locks" && (
                <LockedLockLikes lockedLockLikes={bitcoiner.locklikes} currentBlockHeight={currentBlockHeight} />
              )
            )}
          </>
        )
      }

      
    </div>

    
  );
};

export default TransactionHistory;
