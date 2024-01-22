import React from "react";
import Link from "next/link";

import { getBitcoinersforLocked, getBitcoinersforLiked } from "@/app/utils/get-bitcoiners-leaderboard"

import { PiUserSwitchBold } from "react-icons/pi";

import LoggedInLeaderboard from "@/app/(home)/@leaderboard/LoggedInLeaderboard";

import Image from 'next/image'
import { SiBitcoinsv } from "react-icons/si";


interface LeaderboardProps {
  sort: string;
}

export default async function Leaderboard({ sort }: LeaderboardProps) {
  const bitcoiners = (sort == "locked") ? await getBitcoinersforLocked() : await getBitcoinersforLiked()

  const getStatusEmoji = (bitcoin: number) => {
    if (bitcoin >= 1000) return "🧿"; // Evil eye
    if (bitcoin >= 750) return "🏦"; // Bank
    if (bitcoin >= 500) return "👑"; // Crown
    if (bitcoin >= 250) return "🎩"; // Top hat
    if (bitcoin >= 100) return "💎"; // Diamond
    if (bitcoin >= 50) return "💰"; // Bag
    if (bitcoin >= 21) return "🏆"; // Cash
    if (bitcoin >= 10) return "💸"; // Dime
    if (bitcoin >= 1) return "🤑"; // Money face
    return ""; // Default
  };

  const getRingColor = (totalLiked: number) => {
    if (totalLiked <= 1) {
      return "ring-4 ring-orange-100"; // Cadet (0-1)
    } else if (totalLiked <= 10) {
      return "ring-4 ring-orange-200"; // Guardian (1-10)
    } else if (totalLiked <= 50) {
      return "ring-4 ring-orange-300"; // Sentinel (10-50)
    } else if (totalLiked <= 100) {
      return "ring-4 ring-orange-400"; // Warden (50-100)
    } else if (totalLiked <= 300) {
      return "ring-4 ring-orange-500"; // Protector (100-300)
    } else if (totalLiked <= 500) {
      return "ring-4 ring-orange-600"; // Elder (300-500)
    } else if (totalLiked <= 1000) {
      return "ring-4 ring-orange-700"; // Ascendant (500-1000)
    } else {
      return "ring-4 ring-orange-800"; // Color for 1000+
    }
  } 

  function formatValue(value: number) {
    if (value < 10) {
      return value.toFixed(2);
    } else {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  const getAvatarUrl = (handle: string) => {
    const avatarUrl = "https://a.relayx.com/u/" + handle + "@relayx.io"
    return avatarUrl 
  }  


  return (
    <div>
      <table className="w-full text-md text-gray-500 dark:text-gray-400">
        <thead className="text-sm w-full text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-white">
          <tr>
            <th scope="col" className="pl-6 py-3 w-1/2 text-left text-md">
              {bitcoiners.length !== 0 ? bitcoiners.length : null}{" "}
              <span className="text-md"> Total Bitcoiners</span>
            </th>
            <th scope="col" className="pr-6 py-3 w-1/2">
              <div className="flex justify-end items-center">
                {" "}
                {/* Use items-center for vertical centering */}
                <Link
                  href={
                    "/?tab=leaderboard&ranked=" +
                    (sort == "liked" ? "locked" : "liked")
                  }
                  className="flex justify-end items-center"
                >
                  {" "}
                  {/* Use items-center here too */}
                  <PiUserSwitchBold className="w-6 h-6" />
                  <span className="pl-2 flex justify-end">
                    {sort == "liked" ? "Liked" : "Locked"}
                  </span>
                </Link>
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="w-full">
          <LoggedInLeaderboard sort={sort} bitcoiners={bitcoiners} />
          {bitcoiners.slice(0, 100).map((bitcoiner, index: number) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-black dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <th
                scope="row"
                className="flex items-center px-3 py-4 text-gray-900 whitespace-nowrap dark:text-white"
              >
                <span className="mr-4">{index + 1}.</span>
                <Link
                  href={"/" + bitcoiner.handle}
                  className="flex items-center"
                >
                  <Image
                    width={40} // width and height based on the given h-10 and w-10 classes
                    height={40}
                    className={`rounded-full aspect-square ${(sort == "liked") ? getRingColor(bitcoiner.totalLockLikedFromOthers) : null}`}
                    src={ getAvatarUrl(bitcoiner.handle)}
                    alt={`${bitcoiner.handle} image`}
                  />
                  <div className="pl-3">
                    <div className="flex items-center">
                      <div className="text-md font-semibold overflow-auto">
                        {bitcoiner.handle.length > 14 ? bitcoiner.handle.slice(0,14) + "..." : bitcoiner.handle}
                      </div>
                      <div className="text-xs leading-none align-top ml-1 -mt-2">
                        {getStatusEmoji(bitcoiner.totalAmountLocked)}
                      </div>
                    </div>
                  </div>
                </Link>
              </th>
              {sort == "liked" ? (
                <td className="pr-9 py-4 relative text-right text-black dark:text-white">
                  <div className="flex items-center justify-end">
                    <span className="font-mono">{formatValue(bitcoiner.totalLockLikedFromOthers)}</span>
                    <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
                  </div>                  
                </td>
              ) : (
                <td className="pr-9 py-4 relative text-right text-black dark:text-white">
                <div className="flex items-center justify-end">
                  <span className="font-mono">{formatValue(bitcoiner.totalAmountLocked)}</span>
                  <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
                </div>                  
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
