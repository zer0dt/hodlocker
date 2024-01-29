"use client";

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { usePathname } from "next/navigation";
import { TbShare2 } from "react-icons/tb";
import { RWebShare } from "react-web-share";
import LockLikeInteraction from "../../actions/LockLikeInteraction";

import { LockLikes } from "@prisma/client";

import { WalletContext } from "../../../context/WalletContextProvider";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { AiOutlineBlock } from "react-icons/ai";
import LockLikeDrawer from "./LockLikeDrawer";
import { HODLTransactions } from "@/app/actions";
import { BsReply } from "react-icons/bs";

import Image from "next/image";
import { SiBitcoinsv } from "react-icons/si";

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

function formatNote(note: string) {
  // Convert URLs to anchor tags and embed YouTube iframes
  let formattedNote = note.replace(/https?:\/\/[^\s]+|www\.[^\s]+/g, (url) => {
    // Check if the URL is a YouTube video link
    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `<iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    // Otherwise, create an anchor tag for the URL
    const href = url.startsWith('www.') ? 'http://' + url : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"><span class="text-orange-400">${url}</span></a>`;
  });

  // Convert newlines to <br/>
  formattedNote = formattedNote.replace(/\n/g, "<br/>");
  
  // Convert mentions of type [@handle] and @handle
  const mentionRegex = /@([a-zA-Z0-9_-]+)|\[@([a-zA-Z0-9_-]+)\]/g;
  formattedNote = formattedNote.replace(mentionRegex, (match, p1, p2) => {
      const handle = p1 || p2;
      return `<a href="/${handle}"><span class="text-orange-400">@${handle}</span></a>`;
  });
  
  return DOMPurify.sanitize(formattedNote, { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'frameborder', 'allowfullscreen'] });
}


function Replies({ reply, postLockLike }: RepliesProps) {
  const pathname = usePathname();

  const [avatarRank, setAvatarRank] = useState<number>(0);

  const anonAvatar =
    "https://api.dicebear.com/7.x/shapes/svg?seed=" +
    reply.txid +
    "&backgroundColor=f88c49&shape1Color=0a5b83&shape2Color=f88c49&shape3Color=f1f4dc";
  const relayxAvatar =
    "https://a.relayx.com/u/" + reply.handle_id + "@relayx.io";

  // Check if the current pathname matches the pattern "/[handle]/post/[txid]"
  const isMatchingRoute = /^\/[a-zA-Z0-9_-]+\/post\/[a-zA-Z0-9_-]+$/.test(
    pathname
  );

  const { currentBlockHeight } = useContext(WalletContext)!;

  const [isExpanded, setIsExpanded] = useState(false);

  const [timeSincePost, setTimeSincePost] = useState<string>("");

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  const [likeDrawerOpen, setLikeDrawerOpen] = useState(false);

  const handleLikeDrawerToggle = () => {
    setLikeDrawerOpen(!likeDrawerOpen);
  };


  useEffect(() => {
    function timeSincePost(reply: HODLTransactions) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - reply.created_at.getTime();

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

    timeSincePost(reply);
  }, []);

  function formatBitcoinValue(initialPlusLikesTotal: number) {
    if (initialPlusLikesTotal < 0.0001) {
      return "";
    } else if (initialPlusLikesTotal < 1) {
      return initialPlusLikesTotal.toFixed(2);
    } else if (initialPlusLikesTotal < 10) {
      return initialPlusLikesTotal.toFixed(2);
    } else {
      return (
        initialPlusLikesTotal.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })
      );
    }
  }

  function extractDataUrl(note: string) {
    const dataUrlRegex = /data:image[^'"]*/;
    const match = note.match(dataUrlRegex);
    return match ? match[0] : null;
  }

  // Extract the HTML structure from the note
  const htmlStructure = extractDataUrl(reply.note);

  // Remove the HTML structure from the note
  const noteWithoutHTMLStructure = reply.note.replace(htmlStructure, "");

  useEffect(() => {
    const getAvatarRank = async (handle: string) => {
      // Skip fetching if the handle is "anon"
      if (handle.toLowerCase() === "anon") {
        console.log("Skipping data fetch for 'anon' handle.");
        return;
      }
  
      try {
        const response = await fetch(`/api/bitcoiners/liked/${handle}`);
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
  
        if (data && data.totalLikedFromOthers !== undefined) {
          setAvatarRank(data.totalLikedFromOthers);
        } else {
          console.log(`No data found for bitcoiner with handle: ${handle}`);
          return null;
        }
  
      } catch (error) {
        console.error("There was a problem fetching the bitcoiner's data:", error);
        return null;
      }
    };
  
    getAvatarRank(reply.handle_id);
  }, []);

  const getRingColor = (totalLiked: number) => {
    if (totalLiked <= 1) {
      return "ring-orange-100"; // Cadet (0-1)
    } else if (totalLiked <= 10) {
      return "ring-orange-200"; // Guardian (1-10)
    } else if (totalLiked <= 50) {
      return "ring-orange-300"; // Sentinel (10-50)
    } else if (totalLiked <= 100) {
      return "ring-orange-400"; // Warden (50-100)
    } else if (totalLiked <= 300) {
      return "ring-orange-500"; // Protector (100-300)
    } else if (totalLiked <= 500) {
      return "ring-orange-600"; // Elder (300-500)
    } else if (totalLiked <= 1000) {
      return "ring-orange-700"; // Ascendant (500-1000)
    } else {
      return "ring-orange-800"; // Color for 1000+
    }
  };

  return (
    <>
      <div key={reply.txid} className="bg-white-100 p-0 flex flex-col">
        <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative">
          <div className="flex justify-between px-2 pt-2 relative">
            <div className="flex items-center">
              <Link href={"/" + reply.handle_id}>
                <Image
                  width={40} // width and height based on the given h-10 and w-10 classes
                  height={40}
                  className={`rounded-full aspect-square ring-4 ${getRingColor(
                    avatarRank
                  )}`}
                  src={reply.handle_id == "anon" ? anonAvatar : relayxAvatar}
                  alt={`Profile of ${reply.handle_id}`}
                />
              </Link>
              <div className="ml-3 flex items-center -mt-4">
                <span className="text-md text-black dark:text-white font-semibold block leading-tight">
                  <Link href={"/" + reply.handle_id}>{reply.handle_id}</Link>
                </span>
                <span className="pl-2 text-gray-600 dark:text-gray-300 text-sm block">
                  · {timeSincePost}
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
          <div
            className="text-md text-black-600 dark:text-white px-3 pb-0 ml-12 -mt-3 overflow-auto"
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
            {!isMatchingRoute ? (
              <div>                
                {htmlStructure && (
                  <img src={htmlStructure} className="mb-2" />
                )}                
              </div>
            ) : (
              <div>
                {htmlStructure && <img src={htmlStructure} className="mb-2" />}
              </div>
            )}

            {/* Conditional rendering of the link based on the route pattern */}
            {!isMatchingRoute ? (              
                noteWithoutHTMLStructure.length > 280 && !isExpanded ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        formatNote(noteWithoutHTMLStructure.slice(0, 280)) +
                        "...",
                    }}
                  />
                ) : (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatNote(noteWithoutHTMLStructure),
                    }}
                  />
                )              
            ) : (
              // Render content directly when the route matches the pattern
              <span
                dangerouslySetInnerHTML={{
                  __html: formatNote(noteWithoutHTMLStructure),
                }}
              />
            )}

            {noteWithoutHTMLStructure.length > 280 && (
              <div className="flex justify-end pr-2">
                {!isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
                      e.stopPropagation();
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
          <div className="flex justify-between mx-2 my-1 relative">
            <div className="z-10 ml-12 flex items-center">
              <LockLikeInteraction
                postTxid={undefined}
                replyTxid={reply.txid}
                postLockLike={postLockLike}
              />
              <button
                data-drawer-body-scrolling="false"
                onClick={handleLikeDrawerToggle} // Toggle the drawer when this button is clicked
                className="flex text-black dark:text-white text-sm ml-1 cursor-pointer"
              >
                <span className="font-medium font-mono">{formatBitcoinValue(reply.totalAmountandLockLiked / 100000000)}</span>
                {(reply.totalAmountandLockLiked / 100000000) > 0.001 ? (
                  <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1" />
                ): null}
              </button>
            </div>
            
            <div className="flex gap-2">
              <RWebShare
                data={{
                  text:
                    reply.handle_id +
                    " locked up " +
                    reply.amount / 100000000 +
                    " bitcoin on hodlocker.com",
                  url:
                    "https://www.hodlocker.com/bitcoiner/post/" + reply.post_id,
                  title:
                    reply.handle_id +
                    " locked up " +
                    reply.amount / 100000000 +
                    " bitcoin on hodlocker.com",
                }}
                onClick={() => console.log("shared successfully!")}
              >
                <TbShare2 className="h-5 w-5 text-black dark:text-white justify-end" />
              </RWebShare>
            </div>
          </div>
        </div>
      </div>
      <LockLikeDrawer
        transaction={reply}
        likeDrawerOpen={likeDrawerOpen}
        handleLikeDrawerToggle={handleLikeDrawerToggle}
        currentBlockHeight={currentBlockHeight}
      />
    </>
  );
}

export default Replies;
