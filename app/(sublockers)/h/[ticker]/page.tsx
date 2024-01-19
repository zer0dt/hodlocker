import React, { Suspense } from "react";

import Disclaimer from "@/app/components/Disclaimer";

import Loading from "../../../(home)/loading";

import SublockerFeedBar from "./sublockerFeedBar";
import SublockerFeeds from "./sublockerFeeds";




interface SublockerPageProps {
  params: {
    ticker: string;
  },
  searchParams: {
    tab: string;
    page: number;
    sort: string;
    filter: string;
    ranked: string;
  }
}


export default async function SublockerPage({ params, searchParams }: SublockerPageProps) {


  return (
    <>
      <Disclaimer />
      <main className="pb-24 flex flex-col items-center justify-center pt-2 lg:p-12 lg:pt-6">
        <div className="text-md font-medium text-gray-500 border-b border-gray-200 dark:text-white dark:border-gray-700">
          <Suspense fallback={<Loading />}>
            <SublockerFeedBar params={params} />
          </Suspense>
        </div>

        <div className="w-full">
          <div className="flex justify-center">
            <Suspense fallback={<Loading />}>
              <SublockerFeeds params={params} searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

      </main>
    </>
  );
}