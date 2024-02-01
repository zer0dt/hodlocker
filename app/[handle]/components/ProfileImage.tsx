
import React from 'react'
import Image from 'next/image'

import { getBitcoinerLikedData } from "@/app/utils/get-bitcoiner-avatar-rank"

interface PostProfileImageProps {
  avatar: string,
  handle: string
}

export default async function PostProfileImage({ avatar, handle }: PostProfileImageProps) {

  let bitcoiner = null;

  if (handle !== "anon") {
    bitcoiner = await getBitcoinerLikedData(handle);
  }


  const getRingColor = (totalLiked: number) => {
    if (totalLiked <= 1) {
      return "ring-orange-100"; // Cadet (0-1)
    } else if (totalLiked <= 10) {
      return "ring-orange-200"; // Guardian (1-10)
    } else if (totalLiked <= 50) {
      return "ring-orange-300"; // Sentinel (10-50)
    } else if (totalLiked <= 100) {
      return "ring-orange-400"; // Warden (50-100)
    } else if (totalLiked <= 300) {
      return "ring-orange-500"; // Protector (100-300)
    } else if (totalLiked <= 500) {
      return "ring-orange-600"; // Elder (300-500)
    } else if (totalLiked <= 1000) {
      return "ring-orange-700"; // Ascendant (500-1000)
    } else {
      return "ring-orange-800"; // Color for 1000+
    }
  }

  return (
    <Image
      src={avatar}
      alt={`Profile Picture`}
      width={100} // width and height based on the given h-10 and w-10 classes
      height={100}
      className={`rounded-full aspect-square ring-4 ${bitcoiner ? getRingColor(bitcoiner.totalLockLikedFromOthers) : "ring-orange-100"}`}
    />
  )
}