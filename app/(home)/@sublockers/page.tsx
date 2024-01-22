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

    if (activeTab == "subs") {
        const coinTags = await getAllTags("coin")
        const topicTags = await getAllTags("topic")

        return (
            <div className="grid grid-cols-1 gap-0 w-full lg:w-96">
                <SublockersList searchParams={searchParams} coinTags={coinTags} topicTags={topicTags} />
            </div>
        )
    } else {
        return (
            null
        )
    }    
}




