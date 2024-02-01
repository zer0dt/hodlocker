import React from 'react'
import Image from 'next/image'

export default function ProfileInfoPlaceholder() {
    return (
        <div className="pt-6 px-4 flex items-center">
            <Image
                src={"/bitcoin.png"}
                alt={`Profile Picture`}
                width={100} // width and height based on the given h-10 and w-10 classes
                height={100}
                className="rounded-full aspect-square ring-4 ring-orange-100"
            />
            <div role="status" className="animate-pulse ml-4">
                <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 w-20 -mt-2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-12 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-36 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-24 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-24"></div>
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    )
}