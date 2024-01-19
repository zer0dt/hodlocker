

import { getBitcoinerProfile, getFollowersTotal, getFollowingTotal } from './utils/get-bitcoiner-profile';
import Link from 'next/link';
import { Suspense } from 'react';
import { getBitcoinerTopPosts } from './utils/get-bitcoiner-top-posts';
import { getBitcoinerMentions } from './utils/get-bitcoiner-mentions';

import { getBitcoinerReplies } from './utils/get-bitcoiner-replies';
import ProfileInfo from './components/ProfileInfo';
import Loading from './loading';
import Pagination from '../components/feeds/sorting-utils/Pagination';
import { Metadata, ResolvingMetadata } from 'next';
import { getBitcoinerLocks } from './utils/get-bitcoiner-locks';

interface ProfilePageProps {
    params: {
        handle: string;
    },
    searchParams: {
        tab: string;
        page: number;
    }
}

type Props = {
    params: {
        handle: string
    }
};


export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const totalFollowingAmount = await getFollowersTotal(params.handle);

    const title = params.handle + " (" + (totalFollowingAmount.totalLocklikedFromAllBitcoiners / 100000000).toFixed(2) + " bitcoin following)";
    let description = "hodlocker.com - Don't get psyoped, be locked in.";
    let image = 'https://a.relayx.com/u/' + params.handle + '@relayx.io';

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [{ url: image }],
        },
        twitter: {
            card: 'summary',
            title: title, // Include the title here
            description: description, // Include the description here
            images: [{ url: image }], // Include the image URL here
        },
    };
}


export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {

    let bitcoiner;

    try {
        bitcoiner = await getBitcoinerProfile(params.handle);
        
    } catch (error) {
        console.error("Error fetching Bitcoiner profile:", error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-10 bg-white shadow-md rounded-lg">
                    <p className="text-xl mt-4 text-gray-700">Bitcoiner "{params.handle}" not found</p>
                </div>
            </div>
        );
    }

    const followingItems = await getFollowingTotal(bitcoiner.handle)
    const followerItems = await getFollowersTotal(bitcoiner.handle)

    const activeTab = searchParams.tab ? searchParams.tab : "posts";

    const currentPage = searchParams.page || 1;

    return (
        <main className="flex flex-col items-center justify-center pt-2 lg:pt-12 mx-auto">
            <div className="w-full lg:w-96 flex justify-center items-center">
                <div className="min-w-full rounded-lg mx-auto flex h-screen w-full justify-center bg-white text-sm text-gray-900 antialiased dark:bg-black dark:text-white">
                    <div className="w-full rounded-lg border-x border-gray-100 dark:border-gray-800">

                        <ProfileInfo handle={bitcoiner.handle} followingItems={followingItems} followerItems={followerItems} totalAmountandLockLiked={bitcoiner.totalAmountandLockLiked} created_at={bitcoiner.created_at} />

                        <ul className="mt-1 flex justify-evenly">
                            <li
                                className={`relative flex w-full cursor-pointer items-center justify-center p-4 pb-1 transition duration-150 ease-in-out  ${activeTab == "posts"
                                        ? " border-b-2 border-orange-400 text-orange-400 font-bold"
                                        : "border-b border-transparent text-gray-600 dark:text-white font-bold"
                                    }`}
                            >
                                <Link href={"/" + params.handle + "?tab=posts"}>
                                    posts
                                </Link>
                            </li>
                            <li
                                className={`relative flex w-full cursor-pointer items-center justify-center p-4 pb-1 transition duration-150 ease-in-out  ${activeTab == "replies"
                                        ? "border-b-2 border-orange-400 text-orange-400 font-bold"
                                        : "border-b border-transparent text-gray-600 dark:text-white font-bold"
                                    }`}
                            >
                                <Link href={"/" + params.handle + "?tab=replies"}>
                                    replies
                                </Link>
                            </li>
                            <li
                                className={`relative flex w-full cursor-pointer items-center justify-center p-4 pb-1 transition duration-150 ease-in-out  ${activeTab == "locks"
                                        ? "border-b-2 border-orange-400 text-orange-400 font-bold"
                                        : "border-b border-transparent text-gray-600 dark:text-white font-bold"
                                    }`}
                            >
                                <Link href={"/" + params.handle + "?tab=locks"}>
                                    locks
                                </Link>
                            </li>
                            <li
                                className={`relative flex w-full cursor-pointer items-center justify-center p-4 pb-1 transition duration-150 ease-in-out  ${activeTab == "mentions"
                                        ? "border-b-2 border-orange-400 text-orange-400 font-bold"
                                        : "border-b border-transparent text-gray-600 dark:text-white font-bold"
                                    }`}
                            >
                                <Link href={"/" + params.handle + "?tab=mentions"}>
                                    mentions
                                </Link>
                            </li>
                        </ul>

                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-1 gap-0 w-full pb-40">
                                <Suspense key={activeTab + currentPage} fallback={<Loading />}>
                                    {getBitcoinerTopPosts(params.handle, currentPage, 30)}
                                    <Pagination handle={params.handle} tab={activeTab} currentPage={currentPage} />
                                </Suspense>
                            </div>
                        )}

                        {activeTab === 'replies' && (
                            <Suspense key={activeTab + currentPage} fallback={<Loading />}>
                                <div className="grid grid-cols-1 gap-0 w-full pb-40">
                                    {getBitcoinerReplies(params.handle, currentPage, 30)}
                                    <Pagination handle={params.handle} tab={activeTab} currentPage={currentPage} />
                                </div>
                            </Suspense>
                        )}

                        {activeTab === 'locks' && (
                            <div className="grid grid-cols-1 gap-0 w-full pb-40">
                                <Suspense key={activeTab + currentPage} fallback={<Loading />}>
                                    {getBitcoinerLocks(params.handle, currentPage, 30)}
                                    <Pagination handle={params.handle} tab={activeTab} currentPage={currentPage} />
                                </Suspense>
                            </div>
                        )}

                        {activeTab === 'mentions' && (
                            <div className="grid grid-cols-1 gap-0 w-full pb-40">
                                <Suspense key={activeTab + currentPage} fallback={<Loading />}>
                                    {getBitcoinerMentions(params.handle, currentPage, 30)}
                                    <Pagination handle={params.handle} tab={activeTab} currentPage={currentPage} />
                                </Suspense>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </main>
    );
}



