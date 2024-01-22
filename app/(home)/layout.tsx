import React, { Suspense } from "react"
import FeedBar from "./feedBar"
import Loading from "./loading"

export default function Layout(props: {
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

        <div className="w-full">
          <div className="flex justify-center">
            <Suspense key="sublockers" fallback={<Loading />}>
              {props.sublockers}
            </Suspense>
            <Suspense key="top" fallback={<Loading />}>
            {props.top}
            </Suspense>
            <Suspense key="latest" fallback={<Loading />}>
            {props.latest}
            </Suspense>
            <Suspense key="trending" fallback={<Loading />}>
            {props.trending}
            </Suspense>
            <Suspense key="leaderboard" fallback={<Loading />}>
            {props.leaderboard}
            </Suspense>   
          </div>
        </div>

      </main>
  )
}