
import { Suspense } from "react";
import Loading from "@/app/loading";
import SublockerFeed from "@/app/(home)/@sublockers/page";
import { getSubTopPosts } from "@/app/utils/sublockers/get-sub-top-posts";
import { getSubLatestPosts } from "@/app/utils/sublockers/get-sub-latest-posts";
import { getSubTrendingPosts } from "@/app/utils/sublockers/get-sub-trending-posts";


interface SublockerFeedsProps {
    params: {
        ticker: string
    }
    searchParams: {
        tab: string;
        page: number;
        sort: string;
        filter: string;
        ranked: string;
      };
}

export default async function SublockerFeeds({ params, searchParams }: SublockerFeedsProps) {

    const activeSub = params.ticker

    const activeTab = searchParams.tab || "trending";

    const activeSort = searchParams.sort || "week";

    const activeFilter = searchParams.filter !== undefined ? parseFloat(searchParams.filter) : 0;

    const currentPage = searchParams.page || 1;


    return (
        <div className="grid grid-cols-1 gap-0 w-full lg:w-96 pb-20">

             {activeTab === "subs" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + activeTab + currentPage}
                    fallback={<Loading />}
                  >
                    <SublockerFeed searchParams={searchParams} />
                  </Suspense>
                </div>
              )} 

              {activeTab === "top" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + activeTab + currentPage}
                    fallback={<Loading />}
                  >
                    {getSubTopPosts(activeSub, activeSort, activeFilter, currentPage, 30)}
                    
                  </Suspense>
                </div>
              )}

              {activeTab === "latest" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + activeTab + currentPage}
                    fallback={<Loading />}
                  >
                    {getSubLatestPosts(activeSub, activeSort, activeFilter, currentPage, 30)}
                    
                  </Suspense>
                </div>
              )}

              {activeTab === "trending" && (
                <div>
                  <Suspense
                    key={activeSort + activeFilter + activeTab + currentPage}
                    fallback={<Loading />}
                  >
                    {getSubTrendingPosts(activeSub, activeSort, activeFilter, currentPage, 50)}
                    
                  </Suspense>
                </div>
              )}

            </div>
    )
}