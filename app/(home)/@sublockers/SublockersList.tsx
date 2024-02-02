'use client'

import React, { useState } from "react";
import Link from "next/link";

import { IoIosAddCircleOutline } from "react-icons/io";
import { SiBitcoinsv } from "react-icons/si";

import { createNewTag } from "@/app/server-actions";
import { toast } from "sonner";

interface SublockersProps {
  searchParams: {
    filter: string
    filter2: string
  }
  coinTags: any,
  topicTags: any,
}

export default function Sublockers({ searchParams, coinTags, topicTags }: SublockersProps) {

  const activeFilter = searchParams.filter || 0;
  const activeFilter2 = searchParams.filter2 || 0;

  const sortedCoinTags = [...coinTags].sort((a, b) => b.totalAmountLocked - a.totalAmountLocked);
  const sortedTopicTags = [...topicTags].sort((a, b) => b.totalAmountLocked - a.totalAmountLocked);

  const [type, setType] = useState("topics")

  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(''); // Add state for name input
  const [ticker, setTicker] = useState(''); // Add state for ticker input

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name && ticker) {
      await createSublocker(name, ticker);
      setName(''); // Reset name input
      setTicker(''); // Reset ticker input
    }
  };

  let notActiveClassName =
    "inline-block px-3 py-1 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 border-b-2 border-transparent cursor-pointer";
  let activeClassName =
    "inline-block px-3 py-1 rounded-t-lg dark:text-white text-orange-400 border-b-2 border-orange-400 cursor-pointer";

  // Add responsive classes for mobile, tablet, and desktop to both class names
  notActiveClassName +=
    " sm:inline-block sm:px-3 sm:py-1 sm:text-sm sm:border-b-2";
  activeClassName +=
    " sm:inline-block sm:px-3 sm:py-1 sm:text-sm sm:border-b-2";

  const displayTags = type === "coins" ? sortedCoinTags : sortedTopicTags;

  const createSublocker = async (name: string, ticker: string) => {
    setLoading(true)

    const send = await relayone
      .send({
        to: 'zer0dt@relayx.io',
        amount: 0.20,
        currency: "BSV"
      })
      .catch((e) => {
        console.log(e.message);
        toast.error("An error occurred: " + e.message);
        setLoading(false);
      });

    if (send) {
      try {
        console.log(send);
        toast(
          "Transaction posted on-chain: " +
          send.txid.slice(0, 6) +
          "..." +
          send.txid.slice(-6)
        );
        const newTag = await createNewTag(
          name,
          ticker
        );
        console.log(newTag);
        toast.success(
          "New topic sublocker h/" + ticker + " created!"
        );

      } catch (err) {
        console.log(err);
        toast.error("Error creating topic sublocker: " + err);
      }
    }
  }

  return (
    <>
      <div className="pt-2 text-md font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex justify-between flex-wrap -mb-px">

          <li className={type == "topics" ? activeClassName : notActiveClassName}>
            <div onClick={() => setType("topics")}>
              <p className="text-md dark:text-white">topics</p>
            </div>
          </li>

          <li className={type == "coins" ? activeClassName : notActiveClassName}>
            <div onClick={() => setType("coins")}>
              <p className="text-md dark:text-white">coins</p>
            </div>
          </li>

          <div className="flex-grow"></div>

          <li className={type == "add" ? activeClassName : notActiveClassName}>
            <div onClick={() => setType("add")}>
              <IoIosAddCircleOutline className="w-6 h-6" />
            </div>
          </li>

        </ul>
      </div>
      {(type === "coins" || type === "topics") ? (
        <div>
          <table className="w-full text-md text-gray-500 dark:text-gray-400">
            <thead className="text-sm w-full text-gray-700 uppercase bg-gray-50 dark:bg-black dark:text-white">
              <tr>
                <th scope="col" className="pl-6 py-3 text-center text-md">
                  <span className="text-md">Sublockers</span>
                </th>
                <th scope="col" className="pr-6 py-3 w-1/2">
                  <span className="pl-2 flex justify-end">Locked</span>
                </th>
              </tr>
            </thead>

            <tbody className="w-full">

              {displayTags.slice(0, 100).map((tag, index: number) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-black dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="flex items-center px-3 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <span className="mr-4">{index + 1}.</span>
                    <Link href={`/h/${tag.name}/?tab=trending&sort=year&filter=${activeFilter}&filter2=${activeFilter2}`} className="flex items-center">
                      {type === "coins" && (
                        <img
                          src={tag.name === "SHIB"
                            ? "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png"
                            : tag.name === "ORDI"
                              ? "https://ordinalswallet.com/brc20-logos/ordi.jpg"
                              : tag.name === "BITMAP"
                                ? "https://miro.medium.com/v2/1*8O9TqUhNEIOQsINfR129Yg.jpeg"
                                : tag.name === "DERO"
                                  ? "https://s2.coinmarketcap.com/static/img/coins/64x64/2665.png"
                                  : tag.name === "ARRR"
                                    ? "https://s2.coinmarketcap.com/static/img/coins/64x64/3951.png"
                                    : tag.name === "DOGI"
                                      ? "https://pbs.twimg.com/profile_images/1671484316025606150/LbHoNTiw_400x400.jpg"
                                      : tag.name === "BSV"
                                        ? "https://en.bitcoin.it/w/images/en/5/50/Bitcoin.png"
                                        : tag.name === "LOCKMAP"
                                          ? "/lockmap.jpg"
                                          : tag.name == "1SAT"
                                            ? "https://1satordinals.com/_next/static/media/oneSatLogoDark.171b57a9.svg"
                                            : tag.name == "FTT"
                                              ? "https://s2.coinmarketcap.com/static/img/coins/64x64/4195.png"
                                              : `https://coinicons-api.vercel.app/api/icon/${tag.name.toLowerCase()}`}
                          className="h-8 w-8 rounded-full" />
                      )}
                      <div className="pl-2">
                        <div className="flex items-center">
                          <div className="text-md font-semibold overflow-auto">
                            {tag.fullName}
                            <span className="text-sm text-gray-400 pl-1">
                              {tag.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </th>
                  <th scope="col" className="pr-6 py-3 w-1/2">
                    <div className="flex items-center justify-end">
                      <span className="font-normal font-mono text-gray-900 dark:text-white pl-2">{(tag.totalAmountLocked / 100000000).toFixed(2)}</span>
                      <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
                    </div>
                  </th>

                </tr>
              ))}
            </tbody>
          </table>


        </div>
      ) : null}

      {type === "add" && (
        <div className="flex justify-center w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h5 className="text-xl font-medium text-gray-900 dark:text-white">Topic Sublocker Creation</h5>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
              <input
                type="text"
                id="name"
                className="border text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                placeholder="Name (1-32 characters)"
                maxLength={32} // Restrict to 32 characters
                required
                pattern="\S+.*" // 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Ticker Input */}
            <div>
              <label htmlFor="ticker" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ticker</label>
              <input
                type="text"
                id="ticker"
                className="border text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                placeholder="Ticker (1-16 characters)"
                maxLength={32} // Restrict to 32 characters
                required
                pattern="\S+.*" // 
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              disabled={loading}
            >
              Create Sublocker - 0.20 BSV
            </button>

          </form>
        </div>
      )}

    </>
  );
}
