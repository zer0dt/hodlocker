
'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

interface PostProfileImageProps {
  avatar: string,
  handle: string
}

export default async function ReplyProfileImage({ avatar, handle }: PostProfileImageProps) {

    const [avatarRank, setAvatarRank] = useState(0.01)

    useEffect(() => {
        const getAvatarRank = async (handle: string) => {
          // Skip fetching if the handle is "anon"
          if (handle.toLowerCase() === "anon") {
            console.log("Skipping data fetch for 'anon' handle.");
            return;
          }
      
          try {
            const response = await fetch(`/api/bitcoiners/liked/${handle}`, { next: { revalidate: 600 }});
      
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
      
            const data = await response.json();
      
            if (data && data.totalLikedFromOthers !== undefined) {
              setAvatarRank(data.totalLikedFromOthers);
            } else {
              console.log(`No data found for bitcoiner with handle: ${handle}`);
              return null;
            }
      
          } catch (error) {
            console.error("There was a problem fetching the bitcoiner's data:", error);
            return null;
          }
        };
      
        getAvatarRank(handle);
      }, []);

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
      width={40} // width and height based on the given h-10 and w-10 classes
      height={40}
      className={`rounded-full aspect-square ring-4 ${getRingColor(avatarRank)}`}
    />
  )
}