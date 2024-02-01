import Link from "next/link"

import { format } from 'date-fns';

import Image from 'next/image'
import FollowingDrawer from "./FollowingDrawer";
import FollowerDrawer from "./FollowerDrawer";
import { SiBitcoinsv } from "react-icons/si";

import { getBitcoinerProfile, getFollowersTotal, getFollowingTotal } from '../utils/get-bitcoiner-profile';
import { Suspense } from "react";
import PostProfileImage from "./ProfileImage";


interface ProfileInfoProps {
    handle: string;
}


export default async function ProfileInfo({ handle }: ProfileInfoProps) {

    let bitcoiner;

    try {
        bitcoiner = await getBitcoinerProfile(handle);
        
    } catch (error) {
        console.error("Error fetching Bitcoiner profile:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-10 bg-white shadow-md rounded-lg">
                    <p className="text-xl mt-4 text-gray-700">Bitcoiner "{handle}" not found</p>
                </div>
            </div>
        );
    }


    const followingItems = await getFollowingTotal(handle)
    const followerItems = await getFollowersTotal(handle)

    const avatar = ('https://a.relayx.com/u/' + handle + '@relayx.io')

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
        if (value < 1) {
          return value.toFixed(2);
        } else if (value < 10) {
          return value.toFixed(2);
        } else {
          return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
      }
    
    const loadingAvatar = () => {
        return (
          <Image
            src={"/bitcoin.png"}
            alt={`Profile Picture`}
            width={100} // width and height based on the given h-10 and w-10 classes
            height={100}
            className="rounded-full aspect-square ring-4 ring-orange-100"
          />
        )
      }

    return (
        <>
            <div className="flex items-start px-4 pt-4 pb-0">
                <div className="flex items-center">
                    <Link href="https://avatar.relayx.com/">
                        <Suspense fallback={loadingAvatar()}>
                            <PostProfileImage avatar={avatar} handle={handle} />
                        </Suspense>
                    </Link>
                    <div className="px-4">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold tracking-tight">{handle}</h2>
                            <div className="text-lg leading-none align-top ml-1 -mt-2">{getStatusEmoji(bitcoiner.totalAmountandLockLiked / 100000000)}</div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500 dark:text-gray-400">{formatValue(bitcoiner.totalAmountandLockLiked / 100000000)}</span>
                            <SiBitcoinsv className="text-orange-400 ml-1" />
                        </div>
                        <div className="flex items-center space-x-1 pb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 dark:text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-400"> Joined {format(bitcoiner.created_at, 'MMMM yyyy')}</span>
                        </div>
                        <FollowingDrawer followingItems={followingItems} />
                        <FollowerDrawer followerItems={followerItems} />
                    </div>
                </div>
            </div>
        </>
    );
}    