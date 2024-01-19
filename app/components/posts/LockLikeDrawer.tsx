import React from "react";
import Link from "next/link";
import { SiBitcoinsv } from "react-icons/si";

interface LockLikes {
  txid: string;
  handle_id: string;
  amount: number;
  locked_until: number;
  created_at: Date;
}

interface LockLikeDrawerProps {
  transaction: {
    txid: string;
    locklikes: LockLikes[];
  };
  likeDrawerOpen: boolean;
  handleLikeDrawerToggle: () => void;
  currentBlockHeight?: number; // Ensure you provide the correct type for this prop
}

function timeSinceLike(locklike: LockLikes) {
  const currentTime = new Date().getTime();
  const timeDifference = currentTime - locklike.created_at.getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return (`${days} day${days > 1 ? "s" : ""} ago`);
  } else if (hours > 0) {
    return (`${hours} hour${hours > 1 ? "s" : ""} ago`);
  } else if (minutes > 0) {
    return (`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
  } else {
    return (`${seconds} second${seconds > 1 ? "s" : ""} ago`);
  }
}

const LockLikeDrawer = ({
  transaction,
  likeDrawerOpen,
  handleLikeDrawerToggle,
  currentBlockHeight,
}: LockLikeDrawerProps) => {
  return (
    <div
      id={`drawer-example-${transaction.txid}`} // Unique ID based on transaction.txid
      className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto bg-white w-full lg:w-1/4 dark:bg-black ease-in-out duration-300 ${likeDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      tabIndex={-1}
    >
      <h5 id="drawer-label" className="pl-24 inline-flex items-center mb-2 text-lg font-semibold text-black dark:text-white">
        locks on this post
      </h5>
      <button type="button" onClick={handleLikeDrawerToggle} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white">
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      <div className="mt-0 mb-24 pl-2">
        {transaction.locklikes
          .slice() // Create a copy of the array to avoid mutating the original
          .sort((a: LockLikes, b: LockLikes) => b.amount - a.amount) // Sort by amount in descending order
          .map((locklike: LockLikes, index: number) => (
            <React.Fragment key={locklike.txid}>
              <div className="pt-6 flex items-center font-mono">
                {/* Link with user image */}
                <Link href={"/" + locklike.handle_id} className="flex items-center">
                  <img className="h-6 w-6 cursor-pointer rounded-full" src={'https://a.relayx.com/u/' + locklike.handle_id + '@relayx.io'} />
                </Link>

                {/* Paragraph containing text and other links */}
                <p className="flex items-center text-md text-gray-700 dark:text-gray-300 ml-2">
                  {/* User handle link */}
                  <Link href={"/" + locklike.handle_id}>
                    <b>{locklike.handle_id}</b>
                  </Link>

                  {/* Locked status */}
                  <span className="px-1">locked</span>

                  {/* Transaction link with amount and icon */}
                  <Link href={"https://whatsonchain.com/tx/" + locklike.txid} className="flex items-center">
                    {(locklike.amount / 100000000)} <SiBitcoinsv className="text-orange-400 ml-1 mr-1" /> ⛏️
                    {currentBlockHeight ? (locklike.locked_until - currentBlockHeight).toLocaleString() : "loading..."}
                  </Link>
                </p>
              </div>

              <div className="ml-10 flex items-center text-xs text-gray-700 dark:text-gray-300">
                <p>{timeSinceLike(locklike)}</p>
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default LockLikeDrawer;
