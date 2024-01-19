import React from "react";
import SublockersList from './SublockersList'
import { getAllTags } from '@/app/utils/sublockers/get-tags'


export const dynamic = "force-dynamic";

const coinTags = await getAllTags("coin")
const topicTags = await getAllTags("topic")


export default async function SublockerFeed() {
  return (
    <SublockersList coinTags={coinTags} topicTags={topicTags} />
  )
}




