"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { usePathname } from "next/navigation";

import Image from 'next/image'

import { TbShare2 } from "react-icons/tb";
import { AiOutlineBlock } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";
import { MdExpandLess } from "react-icons/md";

import { RWebShare } from "react-web-share";
import LockLikeInteraction from "../../actions/LockLikeInteraction";
import ReplyInteraction from "../../actions/ReplyInteraction";

import { HODLTransactions } from "../../../server-actions";

import { RelayOneContext } from "../../../context/WalletContextProvider";
import { LockLikes } from "@prisma/client";

import PostPlaceholder from "../../posts/placeholders/PostPlaceholder";
import LockLikeDrawer from "../../posts/LockLikeDrawer";

interface NFTProps {
  post: any;
  postLockLike: (
    txid: string,
    amount: number,
    nLockTime: number,
    handle: string,
    postTxid?: string,
    replyTxid?: string
  ) => Promise<LockLikes>;
}


function formatNote(note: string) {
  // Convert URLs to anchor tags
  let formattedNote = note.replace(/https?:\/\/[^\s]+/g, (match) => {
      return `<a href="${match}" target="_blank" rel="noopener noreferrer"><span class="text-orange-400">${match}</span></a>`;
  });

  // Convert newlines to <br/>
  formattedNote = formattedNote.replace(/\n/g, "<br/>");
  
  // Convert mentions of type [@handle] and @handle
  const mentionRegex = /@([a-zA-Z0-9_-]+)|\[@([a-zA-Z0-9_-]+)\]/g;
  formattedNote = formattedNote.replace(mentionRegex, (match, p1, p2) => {
      const handle = p1 || p2;
      return `<a href="/${handle}"><span class="text-orange-400">@${handle}</span></a>`;
  });
  
  return DOMPurify.sanitize(formattedNote);
}

function extractDataUrl(note: string) {
  const dataUrlRegex = /data:image[^'"]*/;
  const match = note.match(dataUrlRegex);
  return match ? match[0] : null;
}

function NFTPostComponent({ post, postLockLike }: NFTProps) {
  const pathname = usePathname();

  // Check if the current pathname matches the pattern "/[handle]/post/[txid]"
  const isMatchingRoute = /^\/[a-zA-Z0-9_-]+\/post\/[a-zA-Z0-9_-]+$/.test(
    pathname
  );

  const { currentBlockHeight } = useContext(RelayOneContext)!;

  const [lockUpPeriod, setLockUpPeriod] = useState<number | undefined>(0);

  const [isExpanded, setIsExpanded] = useState(false);

  const [timeSincePost, setTimeSincePost] = useState<string>("");

  const [isReplyCardVisible, setIsReplyCardVisible] = useState(false);

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  const [postImage, setPostImage] = useState();
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [likeDrawerOpen, setLikeDrawerOpen] = useState(false)
  
  const handleLikeDrawerToggle = () => {
    setLikeDrawerOpen(!likeDrawerOpen);
  };

  // Ref for the reply card element
  const replyCardRef = useRef(null);



  useEffect(() => {
    setIsLoading(true);
    // Extract the HTML structure from the note
    const htmlStructure = extractDataUrl(post.note);
    setPostImage(htmlStructure);

    // Remove the HTML structure from the note
    const noteWithoutHTMLStructure = post.note.replace(
      htmlStructure,
      ""
    );
    setNote(noteWithoutHTMLStructure);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isMatchingRoute) {
      setIsReplyCardVisible(true);
    }
  }, [isMatchingRoute]);

  useEffect(() => {
    if (currentBlockHeight) {
      setLockUpPeriod(post.locked_until - currentBlockHeight);
    }
  }, [currentBlockHeight]);

  useEffect(() => {
    function timeSincePost(post: HODLTransactions) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - post.created_at.getTime();

      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setTimeSincePost(`${days}d`);
      } else if (hours > 0) {
        setTimeSincePost(`${hours}h`);
      } else if (minutes > 0) {
        setTimeSincePost(`${minutes}m`);
      } else {
        setTimeSincePost(`${seconds}s`);
      }
    }

    timeSincePost(post);
  }, []);

  function formatBitcoinValue(initialPlusLikesTotal: number) {
    if (initialPlusLikesTotal < 0.001) {
      return "";
    } else if (initialPlusLikesTotal < 1) {
      return initialPlusLikesTotal.toFixed(3) + " Ḇ";
    } else if (initialPlusLikesTotal < 10) {
      return initialPlusLikesTotal.toFixed(3) + " Ḇ";
    } else {
      return (
        initialPlusLikesTotal.toLocaleString(undefined, {
          maximumFractionDigits: 3,
        }) + " Ḇ"
      );
    }
  }


  const anonAvatar = "https://api.dicebear.com/7.x/shapes/svg?seed=" + post.txid + "&backgroundColor=f88c49&shape1Color=0a5b83&shape2Color=f88c49&shape3Color=f1f4dc"
  const relayxAvatar = "https://a.relayx.com/u/" + post.handle_id + "@relayx.io"

  return (
    <React.Fragment key={post.txid}>
      <div className="bg-white-100 p-0 flex flex-col">
        <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative">
          <div className="flex justify-between px-2 pt-2">
            <div className="flex items-center rounded-full">
              <Link href={"/" + post.handle_id}>               
                <Image
                    src={post.handle_id == "anon" ? anonAvatar : relayxAvatar}
                    alt={`Profile of ${post.handle_id}`}
                    width={40} // width and height based on the given h-10 and w-10 classes
                    height={40}
                    className="rounded-full aspect-square"
                />               
              </Link>
              <div className="ml-3 flex items-center -mt-4">
                <div className="text-md text-black dark:text-white font-semibold block leading-tight">
                  <Link href={"/" + post.handle_id}>
                    {post.handle_id}
                  </Link>
                </div>
                <div className="pl-2 text-gray-600 dark:text-gray-300 text-sm block">
                  · {timeSincePost}
                </div>
              </div>
            </div>
            <a
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              href={"https://whatsonchain.com/tx/" + post.txid}
            >
              <AiOutlineBlock className="text-black mt-0 mr-0 w-4 h-4" />
            </a>
          </div>
          <div
            className={`text-md text-black-600 dark:text-white px-3 pb-0 ml-12 -mt-3 ${
              isLoading ? "" : "overflow-auto"
            }`}
            ref={(container) => {
              if (container) {
                container.querySelectorAll("audio").forEach((audioElement) => {
                  audioElement.addEventListener("click", (e) => {
                    e.stopPropagation();
                  });
                });
              }
            }}
          >
            {isLoading ? (
              <PostPlaceholder />
            ) : (
              <Link
                href={`/${post.handle_id}/post/${post.txid}`} // Define the desired URL
              >
                {/* Display the HTML structure */}
                {postImage && <img src={postImage} className="mb-1" />}
              </Link>
            )}

            {note.length > 280 && !isExpanded ? (
              <Link
                href={`/${post.handle_id}/post/${post.txid}`} // Define the desired URL
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatNote(note.slice(0, 280)) + "...",
                  }}
                ></div>
              </Link>  
         
            ) : (
              <Link
                href={`/${post.handle_id}/post/${post.txid}`} // Define the desired URL
              >
                <div
                  dangerouslySetInnerHTML={{ __html: formatNote(note) }}
                ></div>
              </Link>
            )}

            {note.length > 280 && (
              <div className="flex justify-end pr-2">
                {" "}
                {/* Use 'flex justify-end' to move buttons to the right */}
                {!isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      toggleExpansion();
                    }}
                    className="text-black-400 dark:text-white hover:underline text-sm pl-2 pb-1"
                  >
                    <MdExpandMore className="h-6 w-6" />
                  </button>
                )}
                {isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      toggleExpansion();
                    }}
                    className="text-black-400 dark:text-white hover:underline text-sm pl-2 pb-1"
                  >
                    <MdExpandLess className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between mx-2 my-1">
            <div className="ml-12 flex items-center">
              <LockLikeInteraction
                postTxid={post.txid}
                replyTxid={undefined}
                postLockLike={postLockLike}
              />
              <button
                data-drawer-body-scrolling="false"
                onClick={handleLikeDrawerToggle} // Toggle the drawer when this button is clicked
                className="text-black dark:text-white text-sm ml-1 cursor-pointer"
              >
                {formatBitcoinValue(post.totalAmountandLockLiked / 100000000)}
              </button>
              
            </div>

            {!isMatchingRoute ? (
              <Link href={`/${post.handle_id}/post/${post.txid}`}>
                <div className="flex gap-1">
                  <FaRegComment className="reply-button mt-1" />
                  <span className="text-sm mt-0.5">
                    {post.totalAmountandLockLikedForReplies
                      ? (
                          post.totalAmountandLockLikedForReplies /
                          100000000
                        ).toFixed(2) + " Ḇ"
                      : null}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex gap-1">
                <FaRegComment className="reply-button mt-1" />
                <span className="text-sm mt-0.5">
                  {post.totalAmountandLockLikedForReplies
                    ? (
                        post.totalAmountandLockLikedForReplies /
                        100000000
                      ).toFixed(2) + " Ḇ"
                    : null}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <RWebShare
                data={{
                  text:
                    post.handle_id +
                    " locked up " +
                    post.amount / 100000000 +
                    " bitcoin on hodlocker.com",
                  url:
                    "https://www.hodlocker.com/" +
                    post.handle_id +
                    "/post/" +
                    post.txid,
                  title:
                    "https://www.hodlocker.com/" +
                    post.handle_id +
                    "/post/" +
                    post.txid,
                }}
                onClick={() => console.log("shared successfully!")}
              >
                <TbShare2 className="h-5 w-5 text-black dark:text-white" />
              </RWebShare>
            </div>
          </div>
        </div>
      </div>
      
      <LockLikeDrawer
        transaction={post}
        likeDrawerOpen={likeDrawerOpen}
        handleLikeDrawerToggle={handleLikeDrawerToggle}
        currentBlockHeight={currentBlockHeight}
      />  

      {isReplyCardVisible && (
        <div
          className="rounded-lg bg-white dark:bg-slate-950 border-t border-gray-300 dark:border-gray-800 p-4"
          ref={replyCardRef}
        >
          <ReplyInteraction transaction={post} />
        </div>
      )}

    </React.Fragment>
  );
}

export default NFTPostComponent;
