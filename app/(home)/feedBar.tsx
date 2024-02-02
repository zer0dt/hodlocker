'use client'

import SortingDropdown from "../components/feeds/sorting-utils/SortingDropdown";
import { IoMdArrowDropdown } from "react-icons/io";
import { useSearchParams } from 'next/navigation'
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import querystring from "querystring";

interface HrefObject {
    path: string;
    query: {
        tab?: string;
        sort?: string;
        filter?: string;
        filter2?: string;
        ranked?: string;
        // Add more query parameters if needed
    };
}


export default function FeedBar() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams()

    const activeSub = "all";

    const activeTab = searchParams.get('tab') || "trending";

    const activeSort = searchParams.get("sort") || "week";

    const activeFilter = searchParams.get("filter") || "0";

    const activeFilter2 = searchParams.get("filter2") || "0";

    const [transitionState, setTransitionState] = useState<{ [key: string]: boolean }>({
        subs: false,
        top: false,
        latest: false,
        trending: false,
        leaderboard: false,
    });

    const handleLinkClick = async (href: HrefObject, tabName: string) => {
        // Set transition state of all tabs to false
        const newTransitionState = {
            subs: false,
            top: false,
            latest: false,
            trending: false,
            leaderboard: false,
        };
        // Set transition state of the clicked tab to true
        newTransitionState[tabName] = true;
        // Update the transitionState
        setTransitionState(newTransitionState);
        startTransition(() => {
            const queryString = querystring.stringify(href.query);
            router.push(`${href.path}?${queryString}`);
        });
    };

    const getClassName = (tabName: string) => {
        let className =
            "inline-block px-3 py-1 rounded-t-lg dark:text-gray-400 border-b-2 cursor-pointer";
        if (activeTab === tabName) {
            className +=
                " inline-block px-3 py-1 rounded-t-lg dark:text-white text-orange-400 border-b-2 border-orange-400";
        } else {
            className +=
                " inline-block px-3 py-1 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 border-b-2 border-transparent";
        }
        // Add responsive classes for mobile, tablet, and desktop to both class names
        className +=
            " sm:inline-block sm:px-3 sm:py-1 sm:text-sm sm:border-b-2";
        return className;
    };

    const loading = () => {
        return (
            <div className="text-center">
                <div role="status">
                    <svg aria-hidden="true" className="inline w-4 h-4 mx-2 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <ul className="flex flex-wrap -mb-px justify-evenly">
            <li className="flex pt-1 pr-2 inline-block relative items-center justify-center rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 border-b-2 border-transparent">
                <SortingDropdown sub={activeSub} tab={activeTab} sort={activeSort} filter={parseFloat(activeFilter) || 0} filter2={parseFloat(activeFilter2) || 0} />
            </li>

            <li onClick={() => handleLinkClick({
                path: '/',
                query: {
                    tab: 'subs',
                    sort: activeSort,
                    filter: activeFilter,
                    filter2: activeFilter2
                }
            }, 'subs')}
                className={getClassName("subs")}
            >

                {(transitionState.subs && isPending) ? loading() : (
                    <div className="flex">
                        <p className="text-md dark:text-white">{activeSub === "all" ? (activeSub) : ("h/" + activeSub)}</p>
                        <IoMdArrowDropdown className="mt-1" />
                    </div>
                )}
            </li>

            <li onClick={() => handleLinkClick({
                path: '/',
                query: {
                    tab: 'top',
                    sort: activeSort,
                    filter: activeFilter,
                    filter2: activeFilter2
                }
            }, 'top')}
                className={getClassName("top")}
            >
                {(transitionState.top && isPending) ? loading() : (
                    <div>
                        <p className="text-md dark:text-white">top</p>
                    </div>
                )}
            </li>

            <li onClick={() => handleLinkClick({
                path: '/',
                query: {
                    tab: 'latest',
                    sort: activeSort,
                    filter: activeFilter,
                    filter2: activeFilter2
                }
            }, 'latest')}
                className={getClassName("latest")}
            >
                {(transitionState.latest && isPending) ? loading() : (
                    <div>
                        <p className="text-md dark:text-white">latest</p>
                    </div>
                )}
            </li>

            <li onClick={() => handleLinkClick({
                path: '/',
                query: {
                    tab: 'trending',
                    sort: activeSort,
                    filter: activeFilter,
                    filter2: activeFilter2
                }
            }, 'trending')}
                className={getClassName("trending")}
            >
                {(transitionState.trending && isPending) ? loading() : (
                    <div>
                        <p className="text-md dark:text-white">trending</p>
                    </div>
                )}
            </li>

            <li onClick={() => handleLinkClick({
                path: '/',
                query: {
                    tab: 'leaderboard',
                    ranked: 'liked'
                }
            }, 'leaderboard')}
                className={getClassName("leaderboard")}
            >
                {(transitionState.leaderboard && isPending) ? loading() : (
                    <div>
                        <p className="text-md dark:text-white">🏆</p>
                    </div>
                )}
            </li>
        </ul>
    );
}
