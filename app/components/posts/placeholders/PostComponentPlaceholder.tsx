
import React from 'react'

export default function PostComponentPlaceholder() {
    
    return (
        <div className="bg-white-100 p-0 flex flex-col">
  <div className="bg-white dark:bg-black border dark:border-gray-800 rounded-lg flex flex-col relative">
    <div className="flex justify-between px-1 pt-2 relative items-center">
      <div className="flex items-center rounded-full">
        {/* Placeholder for Profile Image Skeleton */}
        <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse mr-2"></div>
        <div className="flex items-center">
          {/* Placeholder for Username Skeleton */}
          <div className="w-16 h-4 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse mb-3 -mt-4"></div>
          {/* Placeholder for Time Since Post Skeleton */}
          <div className="w-6 h-3 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse ml-2 mb-3 -mt-4"></div>
        </div>
      </div>
      <div className="absolute right-12 top-5">
        {/* Placeholder for Tags Skeleton */}
        <div className="bg-gray-200 text-gray-800 text-xs font-medium mr-2 -mt-2.5 px-2.5 py-0.5 h-4 w-8 rounded dark:bg-gray-700 dark:text-gray-300 animate-pulse"></div>
      </div>
      <div>
        {/* Placeholder for Block Explorer Link Skeleton */}
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse mr-1 -mt-6"></div>
      </div>
    </div>
    <div className="text-md text-black-600 dark:text-white px-3 pb-0 ml-12 -mt-3 overflow-auto">
      {/* Placeholder for Post Content Skeleton */}
      <div className="w-full h-28 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
    </div>
    <div className="flex justify-between mx-2 my-1 relative items-center">
      <div className="ml-12 flex items-center mt-1">
        {/* Placeholder for Lock and Like Interaction Skeleton */}
        <div className="w-20 h-6 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
      </div>
      <div className="absolute left-56 mt-1">
        {/* Placeholder for Replies Drawer Skeleton */}
        <div className="w-20 h-6 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse"></div>
      </div>
      <div className="flex gap-2 mt-1">
        {/* Placeholder for Web Share Skeleton */}
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
</div>

    )
}