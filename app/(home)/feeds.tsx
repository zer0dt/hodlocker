import Link from "next/link";

import { Suspense } from "react";
import Loading from "./loading";
import SublockerFeed from "../components/feeds/sublockers/SublockerFeed";
import TopFeed from "../components/feeds/TopFeed";
import Pagination from "../components/feeds/sorting-utils/Pagination";
import LatestFeed from "../components/feeds/LatestFeed";
import Leaderboard from "../components/feeds/leaderboard/Leaderboard";
import TrendingFeed from "../components/feeds/TrendingFeed";

interface FeedsProps {
    searchParams: {
        tab: string;
        page: number;
        sort: string;
        filter: string;
        ranked: string;
      };
}

export default async function Feeds({ searchParams }: FeedsProps) {

    const activeTab = searchParams.tab || "trending";

    const activeSort = searchParams.sort || "week";

    const activeFilter = searchParams.filter !== undefined ? parseFloat(searchParams.filter) : 0;

    const currentPage = searchParams.page || 1;

    const activeRank = searchParams.ranked || "liked";

    return (
        <div className="grid grid-cols-1 gap-0 w-full lg:w-96 pb-20">

              {activeTab === "subs" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + "subs" + currentPage}
                    fallback={<Loading />}
                  >
                    <SublockerFeed />
                  </Suspense>
                </div>
              )}

              {activeTab === "top" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + "top" + currentPage}
                    fallback={<Loading />}
                  >
                    <TopFeed sort={activeSort} filter={activeFilter} page={currentPage} limit={30} />
                    <Pagination tab={activeTab} currentPage={currentPage} sort={activeSort} filter={activeFilter} />
                  </Suspense>
                </div>
              )}

              {activeTab === "latest" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + "latest" + currentPage}
                    fallback={<Loading />}
                  >
                    <LatestFeed sort={activeSort} filter={activeFilter} page={currentPage} limit={30} />
                    <Pagination tab={activeTab} currentPage={currentPage} sort={activeSort} filter={activeFilter} />
                  </Suspense>
                </div>
              )}

              {activeTab === "trending" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + "trending" + currentPage}
                    fallback={<Loading />}
                  >
                    <TrendingFeed sort={activeSort} filter={activeFilter} page={currentPage} limit={30} />
                    <Pagination tab={activeTab} currentPage={currentPage} sort={activeSort} filter={activeFilter} />
                  </Suspense>
                </div>
              )}

              {activeTab === "leaderboard" && (
                <>
                  <Link href="https://t.me/LooLockBot" className="flex items-center justify-center pt-2 pb-1">
                    <button type="button" className="text-white bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800 font-medium rounded-lg text-sm px-5 py-2 text-center mr-2 mb-2">
                      Top 100 Lockers Chat
                    </button>
                  </Link>
                  <Suspense key={activeRank} fallback={<Loading />}>
                    <Leaderboard sort={activeRank} />
                  </Suspense>
                </>
              )}


            </div>
    )
}