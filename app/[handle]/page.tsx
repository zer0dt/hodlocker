

import { doesHandleHaveTwitterId, getFollowersTotal } from './utils/get-bitcoiner-profile';
import Link from 'next/link';
import { Suspense } from 'react';
import { getBitcoinerTopPosts } from './utils/get-bitcoiner-top-posts';
import { getBitcoinerMentions } from './utils/get-bitcoiner-mentions';

import { getBitcoinerReplies } from './utils/get-bitcoiner-replies';
import ProfileInfo from './components/ProfileInfo';
import Loading from '@/app/loading';
import Pagination from '../components/feeds/sorting-utils/Pagination';
import { Metadata, ResolvingMetadata } from 'next';
import { getBitcoinerLocks } from './utils/get-bitcoiner-locks';

import ProfileInfoPlaceholder from './components/ProfileInfoPlaceholder'

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

    console.log(params.handle)

    const title = params.handle + " (" + (totalFollowingAmount.totalLocklikedFromAllBitcoiners / 100000000).toFixed(2) + " bitcoin following)";
    let description = "hodlocker.com - Enter the center of Bitcoin.";

    let image = ""

    const isTwitterProfile = await doesHandleHaveTwitterId(params.handle)

    if (isTwitterProfile) {
        image = "https://unavatar.io/twitter/" + params.handle
    } else {
        image = 'https://a.relayx.com/u/' + params.handle + '@relayx.io';
    }
    

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

const Tab = ({tab, activeTab, handle }: { tab: string, activeTab: string, handle: string }) => {
    const classes = (
        `relative flex w-full cursor-pointer items-center justify-center p-4 pb-1 transition duration-150 ease-in-out 
        ${activeTab == tab
            ? " border-b-2 border-orange-400 text-orange-400 font-bold"
            : " hover:border-gray-300 border-b border-transparent text-gray-600 dark:text-white font-bold"
        }`
    )
    return (
        <Link
            href={`/${handle}?tab=${tab}`}
            className={classes}
        >
            <li>
                {tab}
            </li>
        </Link>
    )
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {

    
    const activeTab = searchParams.tab ? searchParams.tab : "posts";

    const currentPage = searchParams.page || 1;

    return (
        <main className="flex flex-col items-center justify-center pt-2 lg:pt-12 mx-auto">
            <div className="w-full lg:w-96 flex justify-center items-center">
                <div className="min-w-full rounded-lg mx-auto flex h-screen w-full justify-center bg-white text-sm text-gray-900 antialiased dark:bg-black dark:text-white">
                    <div className="w-full rounded-lg border-x border-gray-100 dark:border-gray-800">

                        <Suspense fallback={<ProfileInfoPlaceholder />}>
                            <ProfileInfo handle={params.handle} />
                        </Suspense>
                        

                        <ul className="mt-1 flex justify-evenly">
                            <Tab tab="posts" activeTab={activeTab} handle={params.handle} />
                            <Tab tab="replies" activeTab={activeTab} handle={params.handle} />
                            <Tab tab="locks" activeTab={activeTab} handle={params.handle} />
                            <Tab tab="mentions" activeTab={activeTab} handle={params.handle} />
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



