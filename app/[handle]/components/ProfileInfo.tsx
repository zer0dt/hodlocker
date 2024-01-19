'use client'

import Link from "next/link"

import { format } from 'date-fns';
import { useEffect, useState } from "react";

import Image from 'next/image'
import FollowingDrawer from "./FollowingDrawer";
import FollowerDrawer from "./FollowerDrawer";
import { SiBitcoinsv } from "react-icons/si";


interface ProfileInfoProps {
    handle: string;
    followingItems: {
        totalLocklikesToOthers: number;
        locklikesToBitcoiners: Record<string, number>;
    }
    followerItems: {
        totalLocklikedFromAllBitcoiners: number;
        locklikedFromIndividualBitcoiners: Record<string, number>;
    }
    totalAmountandLockLiked: number;
    created_at: Date;
}


export default function ProfileInfo({ handle, followingItems, followerItems, totalAmountandLockLiked, created_at }: ProfileInfoProps) {

    const [avatarRank, setAvatarRank] = useState<number>(0)
    const [followingDrawerOpen, setFollowingDrawerOpen] = useState(false)
    const [followerDrawerOpen, setFollowerDrawerOpen] = useState(false)

    const followingDrawerToggle = () => {
        setFollowingDrawerOpen(!followingDrawerOpen);
    };

    const followerDrawerToggle = () => {
        setFollowerDrawerOpen(!followerDrawerOpen);
    };

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

    const avatarUrl = ('https://a.relayx.com/u/' + handle + '@relayx.io')

    useEffect(() => {
        const getAvatarRank = async (handle: string) => {
            try {
                const response = await fetch("/api/bitcoiners/liked");

                // Check if the response status is okay
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Convert the response to JSON
                const data = await response.json();

                // Find the bitcoiner with the matching handle
                const bitcoiner = data.rankedBitcoiners.find((user) => user.handle === handle);

                if (bitcoiner) {
                    // Log or return the totalLockLikedFromOthers property
                    setAvatarRank(bitcoiner.totalLockLikedFromOthers)
                } else {
                    console.log(`No bitcoiner found with handle: ${handle}`);
                    return null;
                }

            } catch (error) {
                console.error("There was a problem fetching the bitcoiners:", error);
                return null;
            }
        }

        getAvatarRank(handle)
    }, [])

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
        <>
            <div className="flex items-start px-4 pt-4 pb-0">
                <div className="flex items-center">
                    <Link href="https://avatar.relayx.com/">
                        <Image
                            width={100}
                            height={100}
                            className={`rounded-full aspect-square ring-4 ${getRingColor(avatarRank)}`}
                            src={avatarUrl}
                            alt="profile image"
                        />
                    </Link>
                    <div className="px-4">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold tracking-tight">{handle}</h2>
                            <div className="text-lg leading-none align-top ml-1 -mt-2">{getStatusEmoji(totalAmountandLockLiked / 100000000)}</div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-500 dark:text-gray-400">{formatValue(totalAmountandLockLiked / 100000000)}</span>
                            <SiBitcoinsv className="text-orange-400 ml-1" />
                        </div>
                        <div className="flex items-center space-x-1 pb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 dark:text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-400"> Joined {format(created_at, 'MMMM yyyy')}</span>
                        </div>
                        <div onClick={followingDrawerToggle} className="flex justify-start cursor-pointer hover:underline">
                            <span className="font-bold">{formatValue(followingItems.totalLocklikesToOthers / 100000000)}</span>
                            <SiBitcoinsv className="text-orange-400 mx-1 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-400"> following</span>
                        </div>
                        <div onClick={followerDrawerToggle} className="flex justify-start cursor-pointer hover:underline">
                            <span className="font-bold">{formatValue(followerItems.totalLocklikedFromAllBitcoiners / 100000000)}</span>
                            <SiBitcoinsv className="text-orange-400 mx-1" />
                            <span className="text-gray-700 dark:text-gray-400"> followers</span>
                        </div>
                    </div>
                </div>
            </div>

            <FollowingDrawer
                locklikesToBitcoiners={followingItems.locklikesToBitcoiners}
                followingDrawerOpen={followingDrawerOpen}
                followingDrawerToggle={followingDrawerToggle}
            />

            <FollowerDrawer
                locklikedFromIndividualBitcoiners={followerItems.locklikedFromIndividualBitcoiners}
                followerDrawerOpen={followerDrawerOpen}
                followerDrawerToggle={followerDrawerToggle}
            />

        </>
    );
}    