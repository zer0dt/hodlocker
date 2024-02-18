import React, { Suspense } from "react";
import Link from "next/link";
import Image from 'next/image'

import { AiOutlineBlock } from "react-icons/ai";

import LockLikeInteraction from "../actions/LockLikeInteraction";

import { HODLTransactions } from "../../server-actions";

import { LockLikes } from "@prisma/client";

import LockLikeDrawer from "./LockLikeDrawer";
import RepliesDrawer from "./replies/RepliesDrawer";

import PostProfileImage from './PostProfileImage'
import PostContent from "./PostContent";
import WebShare from './WebShare'


import {
  Card,
  CardContent
} from "@/components/ui/card"


interface PostProps {
  transaction: HODLTransactions;
  postLockLike: (
    txid: string,
    amount: number,
    nLockTime: number,
    handle: string,
    postTxid?: string,
    replyTxid?: string
  ) => Promise<LockLikes>;
  postTxid?: string;
}


export default async function Post({ transaction, postLockLike, postTxid }: PostProps) {

  let avatar = "https://a.relayx.com/u/undefined@relayx.io"

  if (transaction.link.avatar != null) {
      avatar = transaction.link.avatar
  } else {
    avatar = transaction.handle_id == "anon" ? (
      "https://api.dicebear.com/7.x/shapes/svg?seed=" +
      transaction.txid +
      "&backgroundColor=f88c49&shape1Color=0a5b83&shape2Color=f88c49&shape3Color=f1f4dc"
    ) : "https://a.relayx.com/u/" + transaction.handle_id + "@relayx.io"
  }


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
    <Card key={transaction.txid} className="border-slate-100 dark:border-slate-700">
      <CardContent className="bg-white-100 p-0 flex flex-col">
        <div className="bg-white dark:bg-black rounded-lg flex flex-col relative">
          <div className="flex justify-between px-2 pt-2 relative">
            <div className="flex items-center rounded-full">
              <Link href={"/" + transaction.handle_id}>
                <Suspense fallback={loadingAvatar()}>
                  <PostProfileImage avatar={avatar} handle={transaction.handle_id} />
                </Suspense>
              </Link>
              <div className="ml-3 flex items-center -mt-4">
                <div className="text-md text-black dark:text-white font-semibold block leading-tight hover:text-orange-400">
                  <Link href={"/" + transaction.handle_id}>
                    {transaction.handle_id}
                  </Link>
                </div>
                <div className="pl-2 text-gray-600 dark:text-gray-300 text-sm flex gap-1">
                  {'·'}
                  <div className="hover:underline">
                    <Link href={"/" + transaction.handle_id + "/post/" + transaction.txid}>
                      {timeSincePost(transaction)}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-10 top-2"> {/* Adjust right and top values as needed */}
              {
                transaction.tags.map(tag => (
                  <Link key={tag.id} href={"/h/" + tag.name}>
                    <div className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 hover:text-orange-400">
                      {tag.name}
                    </div>
                  </Link>
                ))
              }
            </div>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={"https://whatsonchain.com/tx/" + transaction.txid}
            >
              <AiOutlineBlock className="text-black dark:text-white mt-0 mr-0 w-4 h-4 hover:text-orange-400" />
            </a>
          </div>
          <div className="text-md text-black-600 dark:text-white px-3 pb-0 ml-12 -mt-3 overflow-auto">
            <PostContent transaction={transaction} />
          </div>

          <div className="flex justify-between mx-2 my-1 relative">
            <div className="ml-12 flex items-center">
              <LockLikeInteraction
                postTxid={transaction.txid}
                replyTxid={undefined}
                postLockLike={postLockLike}
              />
              <LockLikeDrawer transaction={transaction} />
            </div>


            <div className="absolute left-56 top-0.5">  {/* Adjust right and top values as needed */}
              <RepliesDrawer transaction={transaction} replies={transaction.replies} postLockLike={postLockLike} postTxid={postTxid} />
            </div>

            <div className="flex gap-2">
              <WebShare transaction={transaction} />
            </div>
          </div>
        </div>
      </CardContent>

    </Card>
  );
}

