'use client'

import React, { useContext, useState } from "react";
import Link from "next/link";
import { SiBitcoinsv } from "react-icons/si";
import { HODLTransactions } from "@/app/server-actions";

import { WalletContext } from "../../context/WalletContextProvider";
import { formatBitcoinValue } from "./posts-format";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface LockLikes {
  txid: string;
  handle_id: string;
  amount: number;
  locked_until: number;
  created_at: Date;
}

interface LockLikeDrawerProps {
  transaction: HODLTransactions
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
  transaction
}: LockLikeDrawerProps) => {
  const { currentBlockHeight } = useContext(WalletContext)!;

  return (
    <>


      <Drawer direction="right">
        <DrawerTrigger asChild>
          <div className="flex items-center justify-center">
            {transaction.totalAmountandLockLiked > 1 ? (
              <button
                data-drawer-body-scrolling="false"
                className="flex items-center text-black dark:text-white text-sm ml-1 cursor-pointer hover:text-orange-400"
              >
                <span className="font-medium font-mono">{formatBitcoinValue(transaction.totalAmountandLockLiked / 100000000)}</span>
                <SiBitcoinsv className="text-orange-400 ml-1" />
              </button>
            ) : null}
          </div>
        </DrawerTrigger>
        <DrawerContent className="top-0 right-0 left-auto mt-0 w-full lg:w-1/3 rounded-none bg-white dark:bg-black">

          <DrawerHeader className="flex justify-center">
            <DrawerTitle >Locks on this Post</DrawerTitle>
          </DrawerHeader>

          <div className="flex justify-center">
            <ScrollArea className="max-h-[90vh] overflow-y-auto ml-8 w-full lg:w-2/3 rounded-md scrollbar-thin">
              {transaction.locklikes
                .slice() // Create a copy of the array to avoid mutating the original
                .sort((a: LockLikes, b: LockLikes) => b.amount - a.amount) // Sort by amount in descending order
                .map((locklike: LockLikes, index: number) => (
                  <React.Fragment key={locklike.txid}>
                    <div className="ml-2 pt-6 flex items-center font-mono">
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
            </ScrollArea>

          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default LockLikeDrawer;
