'use client'

import React, { useContext } from 'react';
import Link from 'next/link';
import { WalletContext } from '@/app/context/WalletContextProvider';

import { HODLBitcoiners } from '@/app/server-actions';

import Image from 'next/image'
import { SiBitcoinsv } from 'react-icons/si';

interface LoggedInLeaderboardProps {
    sort: string,
    bitcoiners: HODLBitcoiners[]
  }

export default function LoggedInLeaderboard({ sort, bitcoiners }: LoggedInLeaderboardProps) {
    const { handle } = useContext(WalletContext)!;

    const getStatusEmoji = (bitcoin: number) => {
        if (bitcoin >= 1000) return '🧿';   // Evil eye
        if (bitcoin >= 750) return '🏦';    // Bank
        if (bitcoin >= 500) return '👑';    // Crown
        if (bitcoin >= 250) return '🎩';    // Top hat
        if (bitcoin >= 100) return '💎';    // Diamond
        if (bitcoin >= 50) return '💰';     // Bag
        if (bitcoin >= 21) return '🏆';     // Cash
        if (bitcoin >= 10) return '💸';     // Dime
        if (bitcoin >= 1) return '🤑';      // Money face
        return '';                          // Default
    }

    function formatValue(value: number) {
    if (value < 10) {
        return value.toFixed(2);
    } else {
        return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    }

  const loggedInUserIndex = bitcoiners.findIndex((bitcoiner) => bitcoiner.handle === handle);
  const loggedInUser = bitcoiners[loggedInUserIndex];

  
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

  return (
    <>
        {loggedInUser && (
            <tr className="bg-white border-b-4 dark:bg-black dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="flex items-center px-3 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <span className="mr-4">{loggedInUserIndex + 1}.</span>
                    <Link href={'/' + loggedInUser.handle} className="flex items-center">
                        <Image 
                        width={40} // width and height based on the given h-10 and w-10 classes
                        height={40}
                        className={`rounded-full aspect-square ${(sort === 'liked') ? getRingColor(loggedInUser.totalLockLikedFromOthers) : null}`}
                        src={'https://a.relayx.com/u/' + loggedInUser.handle + '@relayx.io'} 
                        alt={`${loggedInUser.handle} image`} 
                        />
                        <div className="pl-3">
                            <div className="flex items-center">
                                <div className="text-base font-semibold">{loggedInUser.handle}</div>
                                <div className="text-xs leading-none align-top ml-1 -mt-2">
                                  {getStatusEmoji(loggedInUser.totalAmountLocked)}
                                  </div>
                            </div>
                        </div>
                    </Link>
                </th>
                {sort === 'liked' ? (
                    <td className="pr-9 py-4 relative text-right text-black dark:text-white">
                      <div className="font-mono flex items-center justify-end">
                        {formatValue(loggedInUser.totalLockLikedFromOthers)}
                        <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
                      </div>                        
                    </td>
                ) : (
                    <td className="pr-9 py-4 relative text-right text-black dark:text-white">
                      <div className="font-mono flex items-center justify-end">
                        {formatValue(loggedInUser.totalAmountLocked)}
                        <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
                      </div>   
                    </td>
                )}
            </tr>
        )}
    </>
  );
};


