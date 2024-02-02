'use client'

import React, { useState } from "react";
import Link from "next/link";
import { SiBitcoinsv } from "react-icons/si";

interface FollowerDrawerProps {
  followerItems: any
}

const FollowerDrawer = ({
  followerItems
}: FollowerDrawerProps) => {

  const [followerDrawerOpen, setFollowerDrawerOpen] = useState(false)

  const followerDrawerToggle = () => {
    setFollowerDrawerOpen(!followerDrawerOpen);
  };

  function formatValue(value: number) {
    if (value < 1) {
      return value.toFixed(2);
    } else if (value < 10) {
      return value.toFixed(2);
    } else {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  }

  return (
    <>
      <div onClick={followerDrawerToggle} className="flex justify-start cursor-pointer hover:underline">
        <span className="font-bold">{formatValue(followerItems.totalLocklikedFromAllBitcoiners / 100000000)}</span>
        <SiBitcoinsv className="text-orange-400 mx-1" />
        <span className="text-gray-700 dark:text-gray-400"> followers</span>
      </div>
      <div
        id={`drawer-example-followers`}
        className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto bg-white w-full lg:w-1/4 dark:bg-black ease-in-out duration-300 ${followerDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        tabIndex={-1}
      >
        <h5 id="drawer-label" className="pl-12 inline-flex items-center mb-2 text-lg font-semibold text-black dark:text-white">
          {Object.keys(followerItems.locklikedFromIndividualBitcoiners).length} bitcoiners following
        </h5>
        <button type="button" onClick={followerDrawerToggle} className="text-gray-400 bg-transparent hover-bg-gray-200 hover-text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark-hover-bg-gray-600 dark-hover-text-white">
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="mt-0 mb-24 pl-2">
          {Object.entries(followerItems.locklikedFromIndividualBitcoiners) // Convert the object into an array of key-value pairs
            .sort(([, a], [, b]) => b - a) // Sort by the number in descending order
            .map(([handle, number], index) => (
              <React.Fragment key={handle}>
                <div className="pt-6 flex items-center">
                  <Link href={"/" + handle} className="flex items-center">
                    <img className="h-6 w-6 cursor-pointer rounded-full" src={'https://a.relayx.com/u/' + handle + '@relayx.io'} />
                    <div className="flex justify-center items-center">
                      <p className="text-md text-gray-700 dark:text-gray-300 ml-2">
                        <b>{handle}</b> locked <b>{(number / 100000000)}</b>
                      </p>
                      <SiBitcoinsv className="text-orange-400 ml-1" />
                    </div>

                  </Link>
                </div>
              </React.Fragment>
            ))}
        </div>
      </div>
    </>

  );
};

export default FollowerDrawer;
