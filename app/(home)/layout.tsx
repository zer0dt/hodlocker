import React, { Suspense } from "react"
import FeedBar from "./feedBar"
import { Metadata } from "next";
import Loading from "./loading-spinner";


export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Enter the center of Bitcoin.",
  description: "Rank content by locking bitcoin on the on-chain social platform.",
  openGraph: {
    title: "Enter the center of Bitcoin.",
    description: "Rank content by locking bitcoin on the on-chain social platform.",
    images: ["/townsquare.png"],
    url: "https://hodlocker.com",
  },
};

export default async function Layout(props: {
  children: React.ReactNode
  sublockers: React.ReactNode
  top: React.ReactNode
  latest: React.ReactNode
  trending: React.ReactNode
  leaderboard: React.ReactNode
}) {

  return (
    <main className="pb-24 flex flex-col items-center justify-center pt-2 lg:p-12 lg:pt-6">
      <div className="text-md font-medium text-gray-500 border-b border-gray-200 dark:text-white dark:border-gray-700">
        <Suspense fallback={<p>🔒</p>}>
          <FeedBar />
        </Suspense>
      </div>

      <div className="w-full z-0">
        <div className="flex justify-center">

          <Suspense fallback={<Loading />} key={"subs"}>
            {props.sublockers}
          </Suspense>
          <Suspense fallback={<Loading />} key={"top"}>
            {props.top}
          </Suspense>
          <Suspense fallback={<Loading />} key={"latest"}>
            {props.latest}
          </Suspense>
          <Suspense fallback={<Loading />} key={"trending"}>
            {props.trending}
          </Suspense>
          <Suspense fallback={<Loading />} key={"leaderboard"}>
            {props.leaderboard}
          </Suspense>






        </div>
      </div>

    </main>
  )
}