'use client'

import React, { Suspense } from "react";
import Link from "next/link";
import LockLikeInteraction from "../../actions/LockLikeInteraction";

import { LockLikes } from "@prisma/client";

import { AiOutlineBlock } from "react-icons/ai";
import LockLikeDrawer from "../LockLikeDrawer";
import { HODLTransactions } from "@/app/server-actions";

import Image from "next/image";

import PostProfileImage from "./ReplyProfileImage";
import PostContent from "../PostContent";
import WebShare from "../WebShare";

interface RepliesProps {
  reply: HODLTransactions; // Replace with the actual type for replies,
  postLockLike: (
    txid: string,
    amount: number,
    nLockTime: number,
    handle: string,
    postTxid?: string,
    replyTxid?: string
  ) => Promise<LockLikes>;
}

function Replies({ reply, postLockLike }: RepliesProps) {

  const avatar = reply.handle_id == "anon" ? (
    "https://api.dicebear.com/7.x/shapes/svg?seed=" + 
    reply.txid + 
    "&backgroundColor=f88c49&shape1Color=0a5b83&shape2Color=f88c49&shape3Color=f1f4dc"
    ) : "https://a.relayx.com/u/" + reply.handle_id + "@relayx.io"



  function timeSincePost(transaction: HODLTransactions) {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - transaction.created_at.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return (`${days}d`);
    } else if (hours > 0) {
      return (`${hours}h`);
    } else if (minutes > 0) {
      return (`${minutes}m`);
    } else {
      return (`${seconds}s`);
    }
  }

  const loadingAvatar = () => {
    return (
      <Image
        src={"/bitcoin.png"}
        alt={`Profile Picture`}
        width={40} // width and height based on the given h-10 and w-10 classes
        height={40}
        className="rounded-full aspect-square ring-4 ring-orange-100"
      />
    )
  }

  return (
    <>
      <div key={reply.txid} className="bg-white-100 p-0 flex flex-col">
        <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative">
          <div className="flex justify-between px-2 pt-2 relative">
            <div className="flex items-center">
              <Link href={"/" + reply.handle_id}>
              <Suspense fallback={loadingAvatar()}>
                  <PostProfileImage avatar={avatar} handle={reply.handle_id} />
                </Suspense>
              </Link>
              <div className="ml-3 flex items-center -mt-4">
                <span className="text-md text-black dark:text-white font-semibold block leading-tight">
                  <Link href={"/" + reply.handle_id}>{reply.handle_id}</Link>
                </span>
                <span className="pl-2 text-gray-600 dark:text-gray-300 text-sm block">
                  · {timeSincePost(reply)}
                </span>
              </div>
            </div>
            
            <a
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              href={"https://whatsonchain.com/tx/" + reply.txid}
            >
              <AiOutlineBlock className="text-black dark:text-white mt-0 mr-0 w-4 h-4" />
            </a>
          </div>
          <div className="text-md text-black-600 dark:text-white px-3 pb-0 ml-12 -mt-3 overflow-auto">
            <PostContent transaction={reply}/>
          </div>
          <div className="flex justify-between mx-2 my-1 relative">
            <div className="z-10 ml-12 flex items-center">
              <LockLikeInteraction
                postTxid={undefined}
                replyTxid={reply.txid}
                postLockLike={postLockLike}
              />
              <LockLikeDrawer transaction={reply} />
            </div>
            
            <div className="flex gap-2">
              <WebShare transaction={reply} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Replies;
