import React, { Suspense } from "react";

import Disclaimer from "@/app/components/Disclaimer";

import FeedBar from "./feedBar";
import Feeds from "./feeds";
import Loading from "./loading";


interface HomeProps {
  searchParams: {
    tab: string;
    page: number;
    sort: string;
    filter: string;
    ranked: string;
  };
}


export default async function Home({ searchParams }: HomeProps) {

  return (
    <>
      <Disclaimer />
      
      <main className="pb-24 flex flex-col items-center justify-center pt-2 lg:p-12 lg:pt-6">
        <div className="text-md font-medium text-gray-500 border-b border-gray-200 dark:text-white dark:border-gray-700">
         <Suspense fallback={<Loading />}>
          <FeedBar />
         </Suspense>           
        </div>

        <div className="w-full">
          <div className="flex justify-center">
            <Suspense fallback={<Loading />}>
              <Feeds searchParams={searchParams} />
            </Suspense>            
          </div>
        </div>

      </main>
    </>
  );
}