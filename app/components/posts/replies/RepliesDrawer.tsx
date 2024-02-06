

import React from "react";
import ReplyComponent from "./ReplyComponent";
import { LockLikes } from "@prisma/client";
import ReplyInteraction from "@/app/components/actions/ReplyInteraction";

import { FaRegComment } from "react-icons/fa";
import { SiBitcoinsv } from "react-icons/si";
import { HODLTransactions } from "@/app/server-actions";


import { formatBitcoinValue } from "../posts-format";

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

import { ScrollArea } from "@/components/ui/scroll-area"

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

const RepliesDrawer = async ({
  transaction,
  replies,
  postLockLike
}: RepliesDrawerProps) => {


  return (
    <>

      <Drawer>
        <DrawerTrigger asChild>
          <div className="flex items-center justify-center">
            <FaRegComment className="reply-button h-4 w-4 mr-1" />
            <span className="text-sm font-medium font-mono">
              {transaction.totalAmountandLockLikedForReplies
                ? formatBitcoinValue(transaction.totalAmountandLockLikedForReplies / 100000000)
                : null}
            </span>
            {transaction.totalAmountandLockLikedForReplies ? (
              <SiBitcoinsv className="text-orange-400 h-4 w-4 mt-0.5 ml-1" />
            ) : null}
          </div>
        </DrawerTrigger>
        <DrawerContent className="max-h-[100vh] bg-white dark:bg-black">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle >Comments</DrawerTitle>
            </DrawerHeader>

            <ScrollArea className="max-h-[50vh] w-auto overflow-y-auto rounded-md border">
              {replies.map((reply: HODLTransactions, index: number) => (
                <div key={index}>
                  <ReplyComponent reply={reply} postLockLike={postLockLike} />
                </div>
              ))}
            </ScrollArea>
              
            <div className="mx-auto w-full max-w-sm pb-6">
                <ReplyInteraction transaction={transaction} />
              </div>
            
          </div>
        </DrawerContent>
      </Drawer>

    </>
  );
};

export default RepliesDrawer;
