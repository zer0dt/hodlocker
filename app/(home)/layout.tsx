import React, { Suspense } from "react"
import FeedBar from "./feedBar"

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

          {props.sublockers}
          {props.top}
          {props.latest}
          {props.trending}
          {props.leaderboard}

        </div>
      </div>

    </main>
  )
}