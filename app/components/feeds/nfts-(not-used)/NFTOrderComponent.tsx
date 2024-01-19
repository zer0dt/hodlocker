"use client";

import { useState } from "react";
import DeployNFTPost from "../../actions/deployNFTPost";

interface NFTOrderProps {
  collection: any;
  order: any;
}

function NFTOrderComponent({ collection, order }: NFTOrderProps) {

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const postItem = async () => {
    setIsDrawerVisible(!isDrawerVisible)
  };

  const image = "https://berry2.relayx.com/" + order.berry.txid;

  return (
    <>
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 grid grid-cols-4">
        <div className="col-span-1">
          <img
            className="rounded-l-lg w-full"
            src={image}
            alt="product image"
          />
        </div>
        <div className="col-span-2 flex flex-col justify-start px-2 pt-2">
          <h5 className="text-l font-semibold text-gray-900 dark:text-white">
            {collection.name} #{order.props.no}
          </h5>
          <div className="flex items-center">
            {" "}
            {/* Added a flex container */}
            <span className="text-md font-normal text-gray-900 dark:text-white">
              {order.satoshis / 100000000}
            </span>
            <img
              src="/bitcoin.png"
              className="w-4 h-4 ml-1"
              alt="Bitcoin icon"
            />{" "}
            {/* Adjusted styling */}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {order.seller.slice(0, 7) + "..."}
          </p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <button
            onClick={() => {
              postItem();
            }}
            className="text-white bg-orange-400 hover:bg-orange-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Post
          </button>
        </div>
      </div>

      <div
        id="drawer-bottom-example"
        className={`rounded-lg fixed bottom-0 right-0 w-full lg:w-1/3 p-4 overflow-y-auto items-center transition-transform bg-white dark:bg-slate-900 ${
          isDrawerVisible ? "transform-none" : "transform translate-y-full"
        }`}
        tabIndex={-1}
      >
        <h5
          id="drawer-bottom-label"
          className="inline-flex items-center mb-1 text-base font-semibold text-black dark:text-white"
        >
          hodlocker.com
        </h5>
        <button
          onClick={() => setIsDrawerVisible(!isDrawerVisible)}
          type="button"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="pb-24 lg:pb-8">
          <DeployNFTPost
            collection={collection}
            order={order}
            isDrawerVisible={isDrawerVisible}
            closeDrawer={closeDrawer}
          />
        </div>
      </div>
    </>
  );
}

export default NFTOrderComponent;
