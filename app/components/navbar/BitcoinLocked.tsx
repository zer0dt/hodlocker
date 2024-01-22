import React from 'react';
import { getAllBitcoinLocked } from '@/app/utils/get-all-bitcoin-locked';

import { SiBitcoinsv } from 'react-icons/si';

export const revalidate = 60

export default async function BitcoinLocked() {

    const bitcoinLocked = await getAllBitcoinLocked()

    return (
        <span id="badge-dismiss-dark" className="inline-flex items-center px-2 py-1 mr-1 text-sm font-medium text-black bg-gray-100 rounded dark:bg-gray-700 dark:text-white">
            <span className="text-md font-mono">total locked - {Number(bitcoinLocked).toFixed(2)}</span>
            <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
        </span>

    );
}

