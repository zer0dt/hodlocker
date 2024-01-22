import React from "react";
import SublockersList from './SublockersList'
import { getAllTags } from '@/app/utils/sublockers/get-tags'

interface SublockersFeedProps {
    searchParams: {
        tab: string,
        filter: string
    }
}
export const dynamic = "force-dynamic";


export default async function SublockerFeed({ searchParams }: SublockersFeedProps) {
    const activeTab = searchParams.tab || "trending"

    const coinTags = activeTab == "subs" ? await getAllTags("coin") : null
    const topicTags = activeTab == "subs" ? await getAllTags("topic") : null

    return (
        activeTab === "subs" ? (
            <div className="grid grid-cols-1 gap-0 w-full lg:w-96 pb-20">
                <SublockersList searchParams={searchParams} coinTags={coinTags} topicTags={topicTags} />
            </div>
        ) : null
    )
}




