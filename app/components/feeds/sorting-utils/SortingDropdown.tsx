import Link from 'next/link';
import { SiBitcoinsv } from 'react-icons/si';
import FilterIcon from './filter-icon'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from 'flowbite-react';

interface DropdownProps {
  sub: string,
  tab: string,
  sort: string,
  filter: number,
  filter2: number,
}

export default function SortingDropdown({ sub, tab, sort, filter, filter2 }: DropdownProps) {

  // Check if 'sub' is "BSV"
  const basePath = sub === 'all' ? '/' : `/h/${sub}/`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="no-styling focus:outline-none"><FilterIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-28 bg-white dark:bg-black">
        <DropdownMenuLabel>Lock Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Time</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-28 bg-white dark:bg-black">
                <Link href={`${basePath}?tab=${tab}&sort=day&filter=${filter}&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={sort === 'day'} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">Day</DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=week&filter=${filter}&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={sort === 'week'} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">Week</DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=month&filter=${filter}&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={sort === 'month'} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">Month</DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=year&filter=${filter}&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={sort === 'year'} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">Year</DropdownMenuCheckboxItem>
                </Link>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Post Lock</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white dark:bg-black">
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=0&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={filter === 0} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">0 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=0.01&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={filter === 0.01} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">0.01 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=0.1&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={filter === 0.1} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">0.1 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=1&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={filter === 1} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">1 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=10&filter2=${filter2}`}>
                  <DropdownMenuCheckboxItem checked={filter === 10} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">10 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Bitcoiner</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white dark:bg-black">
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=${filter}&filter2=0`}>
                  <DropdownMenuCheckboxItem checked={filter2 === 0} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">0 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=${filter}&filter2=0.01`}>
                  <DropdownMenuCheckboxItem checked={filter2 === 0.01} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">0.01 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=${filter}&filter2=0.1`}>
                  <DropdownMenuCheckboxItem checked={filter2 === 0.1} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">0.1 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=${filter}&filter2=1`}>
                  <DropdownMenuCheckboxItem checked={filter2 === 1} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">1 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
                <Link href={`${basePath}?tab=${tab}&sort=${sort}&filter=${filter}&filter2=10`}>
                  <DropdownMenuCheckboxItem checked={filter2 === 10} className="hover:bg-gray-100 hover:text-orange-500 cursor-pointer">10 <SiBitcoinsv className="text-orange-400 mx-1 mb-0.5" /></DropdownMenuCheckboxItem>
                </Link>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
