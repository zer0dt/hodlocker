"use client";

import React, { useState, useContext, useEffect, useRef } from "react";

import DeployInteraction from "../actions/deployPost";

import { AiFillNotification } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { WalletContext } from "../../context/WalletContextProvider";


import Pusher from "pusher-js";

import Image from "next/image";

import NotificationsDrawer from "./NotificationsDrawer";
import SettingsModal from "./SettingsModal";


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

const AppBar = () => {
  const { fetchRelayOneData, handle, currentBlockHeight } = useContext(WalletContext)!;

  const router = useRouter();
  const pathname = usePathname();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const [notifications, setNotifications] = useState<NewNotifications[]>([]);
  const [notificationsDrawerVisible, setNotificationsDrawerVisible] = useState(false);

  const dropdownRef = useRef(null);

  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const [sublockers, setSublockers] = useState([{ id: 1, name: "BSV" }])

  const [avatar, setAvatar] = useState("https://a.relayx.com/u/" + handle + "@relayx.io")

  const handleSignInorOut = () => {
    setProfileDropdownVisible(!profileDropdownVisible);

    if (handle) {
      console.log("sign out relayx");
      router.push("https://relayx.com/wallet");
      setProfileDropdownVisible(false);
    } else {
      setSignInModalVisible(true);
      setProfileDropdownVisible(false);
    }
  };

  const handleProfileClick = () => {
    console.log("profile click");
    setProfileDropdownVisible(!profileDropdownVisible);
  };


  useEffect(() => {
    fetch('/api/sublockers')
      .then((res) => res.json())
      .then((data) => {
        setSublockers(data.sublockers)
      })
  }, [])

  useEffect(() => {
    setAvatar("https://a.relayx.com/u/" + handle + "@relayx.io")
  }, [handle])

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    var channel = pusher.subscribe("hodlocker");
    channel.bind("new-locklike", function (data: NewNotifications) {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });
    channel.bind("new-post", function (data: NewNotifications) {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });
    channel.bind("new-reply", function (data: NewNotifications) {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    return () => {
      pusher.unsubscribe("hodlocker");
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      // Exclude elements
      const dropdownElement = document.getElementById("profile-button");

      // Check for profile dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownElement !== event.target &&
        !dropdownElement.contains(event.target)
      ) {
        setProfileDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  const smoothScrollToTop = () => {
    return new Promise((resolve) => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setTimeout(resolve, 500); // 500ms is an approximation; adjust as necessary
    });
  };

  const handleHomeClick = async () => {
    await smoothScrollToTop();
    router.push("/")
    router.refresh();
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationsDrawerVisible(!notificationsDrawerVisible);
  };

  const handleSettingsClick = () => {
    setProfileDropdownVisible(false)
    setSettingsModalVisible(true)
  }


  return (
    <>
      <div className="shadow-xl fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-full bottom-4 left-1/2 dark:bg-slate-900 dark:border-gray-600">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          <button
            onClick={() => handleHomeClick()}
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 rounded-l-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <svg
              className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
            <span className="sr-only">Home</span>
          </button>
          <Link
            href={handle ? "/" + handle + "/history/locked" : "#"}
            scroll={true}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <button type="button">
              <svg
                className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11.074 4 8.442.408A.95.95 0 0 0 7.014.254L2.926 4h8.148ZM9 13v-1a4 4 0 0 1 4-4h6V6a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1v-2h-6a4 4 0 0 1-4-4Z" />
                <path d="M19 10h-6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm-4.5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12.62 4h2.78L12.539.41a1.086 1.086 0 1 0-1.7 1.352L12.62 4Z" />
              </svg>
              <span className="sr-only">Wallet</span>
            </button>
          </Link>
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsDrawerVisible(!isDrawerVisible)}
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 font-medium bg-gradient-to-br from-orange-300 to-orange-600 rounded-full hover:bg-orange-500 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
            >
              <svg
                className="w-4 h-4 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M9 1v16M1 9h16"
                />
              </svg>
              <span className="sr-only">New item</span>
            </button>
          </div>

          <button
            type="button"
            id="notify"
            onClick={() => setNotificationsDrawerVisible(!notificationsDrawerVisible)}
            className="pb-1 opacity-100 inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <div className="relative">
              <AiFillNotification className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-500" />
              {notifications.length > 0 ? (
                <div className="absolute bottom-4 left-4 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full dark:border-gray-900">
                  {notifications.length}
                </div>
              ) : null}
            </div>
            <span className="sr-only">Notifications</span>
          </button>

          <button
            type="button"
            id="profile-button"
            onClick={() => handleProfileClick()}
            className="inline-flex flex-col items-center justify-center px-5 py-2 rounded-r-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <Image
              width={40} // width and height based on the given h-10 and w-10 classes
              height={40}
              className="rounded-full"
              src={avatar}
              alt="user"
            />
            <span className="sr-only">Profile</span>
          </button>

          {profileDropdownVisible && (
            <div
              ref={dropdownRef}
              data-dropdown-placement="top"
              className="z-12 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute bottom-20 right-2"
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                <li className="flex justify-around items-center">
                  <a
                    href="https://github.com/zer0dt/hodlocker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full justify-center py-1"
                  >
                    <FaGithub size={18} />
                  </a>
                  <div className="border-r border-gray-100 dark:border-gray-600 h-6 my-1"></div>
                  <a
                    href="https://x.com/hodlocker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full justify-center py-1"
                  >
                    <FaXTwitter size={18} />
                  </a>
                </li>

                {handle ? (
                  <>
                    <li>
                      <Link
                        id="profile-button"
                        href={"/" + handle}
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={() => setProfileDropdownVisible(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button onClick={() => handleSettingsClick()}
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        Settings
                      </button>
                    </li>
                  </>
                ) : null}

                <li>
                  <a
                    href="#"
                    onClick={() => handleSignInorOut()}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {handle ? "Sign Out" : "Sign In"}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div
        className={`pointer-events-none fixed inset-0 bg-black duration-300 ${isDrawerVisible ? "opacity-30" : "opacity-0"
          }`}
      ></div>

      <div
        id="drawer-bottom-example"
        className={`rounded-lg fixed z-20 bottom-0 right-0 w-full lg:w-1/3 p-4 overflow-y-auto items-center transition-transform bg-white dark:bg-black ${isDrawerVisible ? "transform-none" : "transform translate-y-full"
          }`}
        tabIndex={-1}
      >
        <h5
          id="drawer-bottom-label"
          className="inline-flex items-center mb-1 text-base font-mono text-black dark:text-white"
        >
          
        </h5>
        <button
          onClick={() => setIsDrawerVisible(!isDrawerVisible)}
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
          <span className="sr-only">Close menu</span>
        </button>
        <div className="z-30 pb-24 lg:pb-8">
          <DeployInteraction
            subs={sublockers}
            isDrawerVisible={isDrawerVisible}
            closeDrawer={closeDrawer}
          />
        </div>
      </div>

      <NotificationsDrawer
        notifications={notifications}
        clearNotifications={clearNotifications}
        notificationsDrawerVisible={notificationsDrawerVisible}
        setNotificationsDrawerVisible={setNotificationsDrawerVisible}
        currentBlockHeight={currentBlockHeight}
      />

      <div
        className={`pointer-events-none fixed inset-0 bg-black transition-opacity duration-300 ${settingsModalVisible ? "opacity-50" : "opacity-0"
          }`}
      ></div>

      {settingsModalVisible && (
        <SettingsModal handle={handle} setSettingsModalVisible={setSettingsModalVisible} />
      )}

      {signInModalVisible && (
        <div
          id="crypto-modal"
          tabIndex={-1}
          aria-hidden="true"
          className="px-4 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
        >
          <div className="relative w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                onClick={() => setSignInModalVisible(false)}
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="crypto-modal"
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
                <span className="sr-only">Close modal</span>
              </button>

              <div className="px-6 py-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-base font-semibold text-gray-900 lg:text-xl dark:text-white">
                  Sign In
                </h3>
              </div>

              <div className="p-6 flex flex-col items-center justify-center">
                <h1 className="text-xl font-mono text-black dark:text-white pb-4">
                  Enter the center of Bitcoin.
                </h1>
                <ul className="my-2 space-y-3">
                  <li className="items-center flex flex-col justify-center">
                    <button
                      type="button"
                      onClick={() => fetchRelayOneData()}
                      className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                      <div className="flex items-center justify-center">
                        <img src="/relayx.png" className="w-6 h-6 mr-2" />
                        <span>
                          RelayX
                        </span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => alert("not implemented yet")}
                      className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                      <div className="flex items-center justify-center">
                        <img src="/panda.png" className="w-6 h-6 mr-2" />
                        <span>
                          PandaWallet
                        </span>
                      </div>
                    </button>
                  </li>                  
                </ul>

                <div className="flex items-center p-4 my-4 text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="ms-3 text-sm font-medium">
                      Having trouble connecting? {' '}
                      <a
                        href="https://github.com/pow-co/relay-browser-extension/releases"
                        className="font-semibold underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Install the RelayX browser extension for desktop
                      </a>.
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppBar;
