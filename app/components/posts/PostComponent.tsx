"use client";

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

import Image from 'next/image'
import { Tweet } from '../tweets/tweet'


import { TbShare2 } from "react-icons/tb";
import { AiOutlineBlock } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";
import { MdExpandLess } from "react-icons/md";
import { SiBitcoinsv } from "react-icons/si";

import { RWebShare } from "react-web-share";
import LockLikeInteraction from "../actions/LockLikeInteraction";

import { HODLTransactions } from "../../server-actions";

import { WalletContext } from "../../context/WalletContextProvider";
import { LockLikes } from "@prisma/client";

import PostPlaceholder from "./placeholders/PostPlaceholder";
import LockLikeDrawer from "./LockLikeDrawer";
import RepliesDrawer from "./RepliesDrawer";


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
}


function Post({ transaction, postLockLike }: PostProps) {
  const [avatarRank, setAvatarRank] = useState<number>(0)

  const anonAvatar = "https://api.dicebear.com/7.x/shapes/svg?seed=" + transaction.txid + "&backgroundColor=f88c49&shape1Color=0a5b83&shape2Color=f88c49&shape3Color=f1f4dc"
  const relayxAvatar = "https://a.relayx.com/u/" + transaction.handle_id + "@relayx.io"

  const { currentBlockHeight } = useContext(WalletContext)!;

  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_CHARS_PRE_EXPAND = 420;

  const [timeSincePost, setTimeSincePost] = useState<string>("");

  const [replyDrawerVisible, setReplyDrawerVisible] = useState(false);

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  const [postImage, setPostImage] = useState();
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [likeDrawerOpen, setLikeDrawerOpen] = useState(false)

  const handleLikeDrawerToggle = () => {
    setLikeDrawerOpen(!likeDrawerOpen);
  };


  useEffect(() => {
    setIsLoading(true);
    // Extract the HTML structure from the note
    const htmlStructure = extractDataUrl(transaction.note);
    setPostImage(htmlStructure);

    // Remove the HTML structure from the note
    const noteWithoutHTMLStructure = transaction.note.replace(
      htmlStructure,
      ""
    );
    setNote(noteWithoutHTMLStructure);
    setIsLoading(false);
  }, []);



  useEffect(() => {
    function timeSincePost(transaction: HODLTransactions) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - transaction.created_at.getTime();

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

    timeSincePost(transaction);
  }, []);

  function formatBitcoinValue(initialPlusLikesTotal: number) {
    if (initialPlusLikesTotal < 0.001) {
      return "";
    } else if (initialPlusLikesTotal < 1) {
      return initialPlusLikesTotal.toFixed(3);
    } else if (initialPlusLikesTotal < 10) {
      return initialPlusLikesTotal.toFixed(3);
    } else {
      return (
        initialPlusLikesTotal.toLocaleString(undefined, {
          maximumFractionDigits: 3,
        })
      );
    }
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
      const href = url.startsWith('www.') ? 'https://' + url : url;
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

    return DOMPurify.sanitize(formattedNote, { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'frameborder', 'allowfullscreen', 'href', 'target'] });
  }

  function containsTwitterLink(note: string | null | undefined) {
    // Check if note is null or undefined before applying regular expression
    if (note) {
      // Use a regular expression to check for Twitter or X links
      const twitterOrXRegex = /https?:\/\/(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]+\/status\/[0-9]+(\?[^ ]*)?/i;
      return twitterOrXRegex.test(note);
    }
    return false; // Handle the case when note is null or undefined
  }

  function extractDataUrl(note: string) {
    const dataUrlRegex = /data:image[^'"]*/;
    const match = note.match(dataUrlRegex);
    return match ? match[0] : null;
  }

  useEffect(() => {
    const getAvatarRank = async (handle: string) => {
      // Skip fetching if the handle is "anon"
      if (handle.toLowerCase() === "anon") {
        console.log("Skipping data fetch for 'anon' handle.");
        return;
      }
  
      try {
        const response = await fetch(`/api/bitcoiners/liked/${handle}`, { next: { revalidate: 600 }});
  
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
  
    getAvatarRank(transaction.handle_id);
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
  }

  return (
    <React.Fragment key={transaction.txid}>
      <div className="bg-white-100 p-0 flex flex-col">
        <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative">
          <div className="flex justify-between px-2 pt-2 relative">
            <div className="flex items-center rounded-full">
              <Link href={"/" + transaction.handle_id}>
                <Image
                  src={transaction.handle_id == "anon" ? anonAvatar : relayxAvatar}
                  alt={`Profile of ${transaction.handle_id}`}
                  width={40} // width and height based on the given h-10 and w-10 classes
                  height={40}
                  className={`rounded-full aspect-square ring-4 ${getRingColor(avatarRank)}`}
                />
              </Link>
              <div className="ml-3 flex items-center -mt-4">
                <div className="text-md text-black dark:text-white font-semibold block leading-tight">
                  <Link href={"/" + transaction.handle_id}>
                    {transaction.handle_id}
                  </Link>
                </div>
                <div className="pl-2 text-gray-600 dark:text-gray-300 text-sm block">
                  · {timeSincePost}
                </div>
              </div>
            </div>
            <div className="absolute right-10 top-2"> {/* Adjust right and top values as needed */}
              {
                transaction.tags.map(tag => (
                  <Link key={tag.id} href={"/h/" + tag.name}>
                    <div className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                      {tag.name}
                    </div>
                  </Link>
                ))
              }
            </div>
            <a
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              href={"https://whatsonchain.com/tx/" + transaction.txid}
            >
              <AiOutlineBlock className="text-black dark:text-white mt-0 mr-0 w-4 h-4" />
            </a>
          </div>
          <div
            className={`text-md text-black-600 dark:text-white px-3 pb-0 ml-12 -mt-3 ${isLoading ? "" : "overflow-auto"
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
                href={`/${transaction.handle_id}/post/${transaction.txid}`} // Define the desired URL
              >
                {/* Display the HTML structure */}
                {postImage && <Image src={postImage} width={0} height={0} style={{ width: '100%', height: 'auto' }} sizes="100vw" alt="post image" className="mb-1" />}
              </Link>
            )}

            {note.length > MAX_CHARS_PRE_EXPAND && !isExpanded ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: formatNote(note.slice(0, MAX_CHARS_PRE_EXPAND)) + "...",
                }}
              ></div>
            ) : (
              containsTwitterLink(note) ? (
                <>
                  <div dangerouslySetInnerHTML={{ __html: formatNote(note) }} />
                  <Tweet id={note.match(/\/status\/([0-9]+)/)[1]} />
                </>

              ) : (
                // Render the formatted note if it's not a Twitter link
                <div dangerouslySetInnerHTML={{ __html: formatNote(note) }} />
              )
            )}

            {note.length > MAX_CHARS_PRE_EXPAND && (
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

          <div className="flex justify-between mx-14 my-2 relative">
            <div className="flex items-center">
              <LockLikeInteraction
                postTxid={transaction.txid}
                replyTxid={undefined}
                postLockLike={postLockLike}
              />
              <button
                data-drawer-body-scrolling="false"
                onClick={handleLikeDrawerToggle} // Toggle the drawer when this button is clicked
                className="flex items-center text-black dark:text-white text-sm ml-1 cursor-pointer"
              >
                <span className="font-medium font-mono">{formatBitcoinValue(transaction.totalAmountandLockLiked / 100000000)}</span>
                {(transaction.totalAmountandLockLiked / 100000000) > 0.001 ? (
                  <SiBitcoinsv className="text-orange-400 ml-1" />
                ) : null}

              </button>
            </div>


            <div className="top-0.5">  {/* Adjust right and top values as needed */}
              <div onClick={() => setReplyDrawerVisible(!replyDrawerVisible)} className="flex gap-1 mb-1 cursor-pointer">
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
            </div>

            <div className="flex gap-2 cursor-pointer">
              <RWebShare
                data={{
                  text:
                    transaction.handle_id +
                    " locked up " +
                    transaction.amount / 100000000 +
                    " bitcoin on hodlocker.com",
                  url:
                    "https://www.hodlocker.com/" +
                    transaction.handle_id +
                    "/post/" +
                    transaction.txid,
                  title:
                    "https://www.hodlocker.com/" +
                    transaction.handle_id +
                    "/post/" +
                    transaction.txid,
                }}
                onClick={() => console.log("shared successfully!")}
              >
                <TbShare2 className="h-5 w-5 text-black dark:text-white" />
              </RWebShare>
            </div>
          </div>
        </div>

        <div
          className={`z-10 pointer-events-none fixed inset-0 bg-black duration-300 ${replyDrawerVisible ? 'opacity-30' : 'opacity-0'
            }`}>
        </div>

        {replyDrawerVisible ? (
          <RepliesDrawer transaction={transaction} replies={transaction.replies} replyDrawerVisible={replyDrawerVisible} setReplyDrawerVisible={setReplyDrawerVisible} postLockLike={postLockLike} />
        ) : null}

      </div>

      <LockLikeDrawer
        transaction={transaction}
        likeDrawerOpen={likeDrawerOpen}
        handleLikeDrawerToggle={handleLikeDrawerToggle}
        currentBlockHeight={currentBlockHeight}
      />

    </React.Fragment>
  );
}

export default Post;
