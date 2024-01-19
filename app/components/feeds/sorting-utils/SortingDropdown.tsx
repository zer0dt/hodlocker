'use client';

import { Dropdown } from 'flowbite-react';
import { DropdownItem } from 'flowbite-react/lib/esm/components/Dropdown/DropdownItem';
import Link from 'next/link';
import { BiFilter } from "react-icons/bi";
import { SiBitcoinsv } from 'react-icons/si';

interface DropdownProps {
  sub: string,
  tab: string,
  sort: string,
  filter: number
}

export default function SortingDropdown({ sub, tab, sort, filter }: DropdownProps) {

  // Check if 'sub' is "BSV"
  const basePath = sub === 'all' ? '/' : `/h/${sub}/`;

  const dropdownButton = (title: string) => {
    return (
      <button
        className="flex rounded items-center justify-between w-full px-4 py-2 hover-bg-gray-100 text-gray-700 dark:text-gray-200 bg-white dark:text-gray-200 dark:bg-gray-700"
      >
        {title}
        <svg
          className="w-2.5 h-2.5 ml-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 9 4-4-4-4"
          />
        </svg>
      </button>
    )
  }

  const filterIcon = () => {
    return (
      <BiFilter />
    )
  }

  const dropdownItemTitle = (titleWithSymbol: string) => {
    const titleValue = titleWithSymbol.replace(' Ḇ', ''); // Strip 'Ḇ' from the title
    const isHighlighted = sort === titleValue || filter.toString() === titleValue;

    return (
      <span className={`${isHighlighted ? 'font-bold text-orange-400' : ''}`}>
        {titleWithSymbol}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <Dropdown label="Dropdown"  renderTrigger={() => filterIcon()}>
        <div className="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-gray-700 rounded shadow">
          <Dropdown label="Duration" placement="right" renderTrigger={() => dropdownButton("duration")}>
            <DropdownItem>
              <Link
                href={`${basePath}?tab=${tab}&sort=day&filter=${filter}`}
              >
                {dropdownItemTitle("day")}
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link
                href={`${basePath}?tab=${tab}&sort=week&filter=${filter}`}
              >
                {dropdownItemTitle("week")}
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link
                href={`${basePath}?tab=${tab}&sort=month&filter=${filter}`}
              >
                {dropdownItemTitle("month")}
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link
                href={`${basePath}?tab=${tab}&sort=year&filter=${filter}`}
              >
                {dropdownItemTitle("year")}
              </Link>
            </DropdownItem>
          </Dropdown>

          <Dropdown dismissOnClick={true} label="Minimum Lock" placement="right" renderTrigger={() => dropdownButton("lock")}>
            <DropdownItem>
              <Link className="flex justify-center"
                href={`${basePath}?tab=${tab}&sort=${sort}&filter=0`}
              >
                {dropdownItemTitle("0")}
                <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" />
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link className="flex justify-center"
                href={`${basePath}?tab=${tab}&sort=${sort}&filter=0.01`}
              >
                {dropdownItemTitle("0.01")}
                <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" />
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link className="flex justify-center"
                href={`${basePath}?tab=${tab}&sort=${sort}&filter=0.1`}
              >
                {dropdownItemTitle("0.1")}
                <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" />
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link className="flex justify-center"
                href={`${basePath}?tab=${tab}&sort=${sort}&filter=1`}
              >
                {dropdownItemTitle("1")}
                <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" />
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link className="flex justify-center"
                href={`${basePath}?tab=${tab}&sort=${sort}&filter=10`}
              >
                {dropdownItemTitle("10")}
                <SiBitcoinsv className="text-orange-400 mt-0.5 ml-1 mr-1" />
              </Link>
            </DropdownItem>
          </Dropdown>
        </div>
      </Dropdown>
    </div>
  )
}