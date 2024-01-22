'use client'

// Pagination.tsx
import React from "react";
import Link from "next/link";

interface PaginationProps {
   handle?: string,
    currentPage: number,
    tab: string,
    sort: string,
    filter: number
}

const scrollTop = () => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 1000); // 500 milliseconds (adjust the delay as needed)
};


const Pagination = ({ handle, currentPage, tab, sort, filter }: PaginationProps) => {

  const nextLink = "/" + (handle ? handle : "") +  "?tab=" + tab + "&sort=" + sort + "&filter=" + filter + "&page=" + (Number(currentPage) + 1);
  const prevLink = "/" + (handle ? handle : "") +  "?tab=" + tab + "&sort=" + sort + "&filter=" + filter + "&page=" + (Number(currentPage) - 1);

  return (
    <div className="pt-4 px-4 mb-8 flex justify-between">
      {currentPage > 1 ? (
        <Link key={"prev" + currentPage} onClick={scrollTop} scroll={true} href={prevLink}>
          <button className="relative inline-flex items-center justify-center p-0.5 mb-2 ml-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-orange-600 to-orange-300 group-hover:from-orange-600 group-hover:to-orange-300 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
              </svg>
            </span>
          </button>
        </Link>
      ) : (
        <div></div>
      )}

      <p className="text-2xl pt-1 font-black text-gray-900 dark:text-white">
        {currentPage > 1 ? currentPage : null}
      </p>

      <Link key={"next" + currentPage} onClick={scrollTop} scroll={true} href={nextLink}>
        <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-orange-300 to-orange-600 group-hover:from-orange-300 group-hover:to-orange-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </span>
        </button>
      </Link>
    </div>
  );
};

export default Pagination;