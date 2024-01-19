import React from "react";
import Link from "next/link";
import { SiBitcoinsv } from "react-icons/si";

interface FollowingDrawerProps {
  locklikesToBitcoiners: Record<string, number>;
  followingDrawerOpen: boolean;
  followingDrawerToggle: () => void;
}

const FollowingDrawer = ({
  locklikesToBitcoiners,
  followingDrawerOpen,
  followingDrawerToggle
}: FollowingDrawerProps) => {
  return (
    <div
      id={`drawer-example-following`} // Unique ID based on transaction.txid
      className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto bg-white w-full lg:w-1/4 dark:bg-black ease-in-out duration-300 ${followingDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      tabIndex={-1}
    >
      <h5 id="drawer-label" className="pl-12 inline-flex items- center mb-2 text-lg font-semibold text-black dark:text-white">
        following {Object.keys(locklikesToBitcoiners).length} bitcoiners
      </h5>
      <button type="button" onClick={followingDrawerToggle} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white">
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      <div className="mt-0 mb-24 pl-2">
        {Object.entries(locklikesToBitcoiners) // Convert the object into an array of key-value pairs
          .sort(([, a], [, b]) => b - a) // Sort by the number in descending order
          .map(([handle, number], index) => (
            <React.Fragment key={handle}>
              <div className="pt-6 flex items-center">
                <Link href={"/" + handle} className="flex items-center">
                  <div className="flex items-center"> {/* Added div container */}
                    <div className="text-md text-gray-700 dark:text-gray-300 ml-2 pr-2 flex items-center"> {/* Apply flex class here */}
                      <span className="pr-1">locked</span> <b className="pr-1">{(number / 100000000)} </b>
                      <SiBitcoinsv className="text-orange-400 mr-1" /> on
                      <div className="pl-2 flex items-center"> {/* New div for the image */}
                        <img className="h-6 w-6 cursor-pointer rounded-full" src={'https://a.relayx.com/u/' + handle + '@relayx.io'} />
                        <b className="pl-1">{handle}</b>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default FollowingDrawer;
