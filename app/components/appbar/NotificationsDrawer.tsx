"use client";

import DOMPurify from "dompurify";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { MdDeleteSweep } from "react-icons/md";
import { BsReply } from "react-icons/bs";
import { TbLockCheck } from "react-icons/tb";
import { SiBitcoinsv } from "react-icons/si";

interface NotificationsDrawerProps {
  notifications: any;
  clearNotifications: any;
  notificationsDrawerVisible: any;
  setNotificationsDrawerVisible: any;
  currentBlockHeight: number | undefined;
}

interface NewNotifications {
  message: {
    txid: string;
    amount: number;
    handle_id: string;
    note: string;
    created_at: Date;
    locked_until: number;
    post_id?: string;
    reply_txid?: string;
  };
  type: string;
}

const NotificationsDrawer = ({
  notifications,
  clearNotifications,
  notificationsDrawerVisible,
  setNotificationsDrawerVisible,
  currentBlockHeight,
}: NotificationsDrawerProps) => {
  const notificationDrawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (notificationsDrawerVisible && notificationDrawerRef.current) {
      const element = notificationDrawerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [notificationsDrawerVisible]);

  useEffect(() => {
    function handleOutsideClick(event) {
      // Exclude elements
      const notifyElement = document.getElementById("notify");

      // Check for notifications drawer
      if (
        notificationDrawerRef.current &&
        !notificationDrawerRef.current.contains(event.target) &&
        notifyElement !== event.target &&
        !notifyElement.contains(event.target)
      ) {
        setNotificationsDrawerVisible(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function timeSincePost(notification: NewNotifications) {
    const currentTime = new Date().getTime();
    const timeDifference =
      currentTime - new Date(notification.message.created_at).getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
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

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-0 bg-black transition-opacity duration-300 ${
          notificationsDrawerVisible ? "opacity-30" : "opacity-0"
        }`}
      ></div>

      <div
        id="notifications-drawer"
        ref={notificationDrawerRef}
        className={`max-h-96 z-10 rounded-lg fixed bottom-0 right-0 w-full lg:w-1/3 p-4 pb-24 lg:pb-10 shadow-lg overflow-y-auto items-center transition-transform bg-white dark:bg-black ${
          notificationsDrawerVisible
            ? "transform-none"
            : "translate-y-full"
        }`}
        tabIndex={-1}
        aria-labelledby="notifications-label"
      >
        <div className="flex py-2 justify-center items-center">
          <h5
            id="notifications-label"
            className="inline-flex items-center mb-1 text-lg font-semibold text-black dark:text-white"
          >
            Notifications
          </h5>

          <div className="flex justify-end">
            <button
              onClick={() =>
                setNotificationsDrawerVisible(!notificationsDrawerVisible)
              }
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
              <span className="sr-only">Close notifications</span>
            </button>

            {/* Clear notifications button */}
            <button
              onClick={clearNotifications}
              type="button"
              className="pl-2 inline-flex text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white absolute top-4 left-2"
            >
              {notifications.length > 0 ? (
                <MdDeleteSweep className="w-6 h-6" />
              ) : null}
              <span className="sr-only">Clear notifications</span>
            </button>
          </div>
        </div>

        <div>
          {/* Notifications content */}
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative"
            >
              <div className="flex justify-between px-2 pt-2 pb-1">
                <div className="flex items-center">
                  <Link href={"/" + notification.message.handle_id}>
                    <Image
                      width={40} // width and height based on the given h-10 and w-10 classes
                      height={40}
                      className="rounded-full"
                      src={
                        notification.message.handle_id == "anon"
                          ? "https://api.dicebear.com/7.x/shapes/svg?seed=" +
                            notification.message.txid +
                            "&backgroundColor=f88c49&shape1Color=0a5b83&shape2Color=f88c49&shape3Color=f1f4dc"
                          : "https://a.relayx.com/u/" +
                            notification.message.handle_id +
                            "@relayx.io"
                      }
                      alt={`Profile of ${notification.message.handle_id}`}
                    />
                  </Link>
                  <div className="ml-3">
                    <span className="text-md text-black dark:text-white font-semibold block leading-tight">
                      <Link href={"/" + notification.message.handle_id}>
                        {notification.message.handle_id}
                      </Link>
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 text-xs block">
                      {timeSincePost(notification)}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`text-sm text-black-600 dark:text-white px-4 pb-2 pt-0 ml-12`}
              >
                {notification.type === "post" ? (
                  <Link
                    onClick={() => setNotificationsDrawerVisible(false)}
                    href={
                      "/" +
                      notification.message.handle_id +
                      "/post/" +
                      notification.message.txid
                    }
                  >
                    {notification.message.note.length > 280 ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            formatNote(
                              notification.message.note.slice(0, 280)
                            ) + "...",
                        }}
                      ></div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatNote(notification.message.note),
                        }}
                      ></div>
                    )}
                  </Link>
                ) : notification.type === "reply" ? (
                  <>
                    <Link
                      onClick={() => setNotificationsDrawerVisible(false)}
                      href={"/bitcoiner/post/" + notification.message.post_id}
                    >
                      {notification.message.note.length > 280 ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              formatNote(
                                notification.message.note.slice(0, 280)
                              ) + "...",
                          }}
                        ></div>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatNote(notification.message.note),
                          }}
                        ></div>
                      )}
                    </Link>
                    <div className="flex items-center justify-end">
                      {" "}
                      {/* Added justify-end here */}
                      <Link
                        onClick={() => setNotificationsDrawerVisible(false)}
                        href={"/bitcoiner/post/" + notification.message.post_id}
                      >
                        <BsReply className="h-5 w-5" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <Link className="flex justify-start font-mono"
                      onClick={() => setNotificationsDrawerVisible(false)}
                      href={
                        "/bitcoiner/post/" +
                        (notification.message.post_id ||
                          notification.message.reply_txid ||
                          "/")
                      }
                    >
                      locked {notification.message.amount / 100000000} <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" />
                       for{" "}
                      {notification.message.locked_until -
                        (currentBlockHeight ? currentBlockHeight : 0)}{" "}
                      blocks!
                    </Link>

                    <div className="flex items-center justify-end">
                      {" "}
                      {/* Added justify-end here */}
                      <Link
                        onClick={() => setNotificationsDrawerVisible(false)}
                        href={
                          "/bitcoiner/post/" +
                          (notification.message.post_id
                            ? notification.message.post_id
                            : notification.message.reply_txid)
                        }
                      >
                        <TbLockCheck className="h-5 w-5" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsDrawer;
