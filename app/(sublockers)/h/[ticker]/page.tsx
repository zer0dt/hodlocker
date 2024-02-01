import React, { Suspense } from "react";

import Disclaimer from "@/app/components/Disclaimer";

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
    filter2: string
    ranked: string;
  }
}


export default async function SublockerPage({ params, searchParams }: SublockerPageProps) {

  return (
    <>
      <Disclaimer />
      <main className="pb-24 flex flex-col items-center justify-center pt-2 lg:p-12 lg:pt-6">
        <div className="text-md font-medium text-gray-500 border-b border-gray-200 dark:text-white dark:border-gray-700">
          <Suspense fallback={<p>🔒</p>}>
            <SublockerFeedBar params={params} />
          </Suspense>
        </div>

        <div className="w-full">
          <div className="flex justify-center">
              <SublockerFeeds params={params} searchParams={searchParams} />
          </div>
        </div>

      </main>
    </>
  );
}