'use client';

import { Dropdown } from 'flowbite-react';
import { DropdownItem } from 'flowbite-react/lib/esm/components/Dropdown/DropdownItem';
import Link from 'next/link';
import { BiFilter } from "react-icons/bi";

interface CollectionDropdownProps {
    collectionInfo: any
}

export default function CollectionDropdown({ collectionInfo }: CollectionDropdownProps) {

    const dropdownButton = (title: string) => {
        return (
            <button
                className="flex rounded items-center justify-between bg-opacity-0 px-4 py-2 hover-bg-gray-100 text-gray-500 dark:text-gray-200 bg-white dark:text-gray-200 dark:bg-gray-700"
            >
                <b>{title}</b>
                <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
            </button>
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
    <div className="py-2 flex items-center justify-center relative inline-block">
        <Dropdown placement="bottom" label={collectionInfo.name} dismissOnClick={true} renderTrigger={() => dropdownButton(collectionInfo.name)}>
              <Link
                href={`/?tab=nfts&collection=12d8ca4bc0eaf26660627cc1671de6a0047246f39f3aa06633f8204223d70cc5_o2`}
              >
                <Dropdown.Item>Rexxie</Dropdown.Item>
              </Link>
              <Link
                href={`/?tab=nfts&collection=df0ed709f0a4d5462a61dcbd128e5f73236892178847dc906345e476383368bf_o1`}
              >
                <Dropdown.Item>The System Collection®</Dropdown.Item>
              </Link>
        </Dropdown>
    </div>
  )
}