import React, { Suspense } from "react"
import FeedBar from "./feedBar"
import { Metadata } from "next";


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

export default async function FeedLayout(props: {
  children: React.ReactNode
  sublockers: React.ReactNode
  top: React.ReactNode
  latest: React.ReactNode
  trending: React.ReactNode
  images: React.ReactNode
  leaderboard: React.ReactNode
  search: React.ReactNode
}) {

  return (
    <main className="pb-24 flex flex-col items-center justify-center pt-2 lg:p-12 lg:pt-6 pb-10">
      <div className="text-md font-medium text-gray-500 border-b border-gray-200 dark:text-white dark:border-gray-700">
        <Suspense fallback={<p>🔒</p>}>
          <FeedBar />
        </Suspense>
      </div>

      <div className="w-full z-0">
        <div className="flex justify-center">

          {props.top}
          {props.latest}
          {props.trending}
          {props.images}
          {props.leaderboard}
          {props.search}

        </div>
      </div>

    </main>
  )
}