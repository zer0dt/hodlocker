
import React from 'react'
import TransactionHistory from "./TransactionHistory";
import { getBitcoinerLockedTxs } from './getBitcoinerLockedTxs';
import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'

interface HandleDetailsProps {
    params: {
        handle: string
    },
    searchParams: {
        type: string
    }
}

export default async function HandleDetails({params, searchParams}: HandleDetailsProps) { 
    const bitcoiner = await getBitcoinerLockedTxs(params.handle);
    const currentBlockHeight = await fetchCurrentBlockHeight();

      return (
        <main className="flex flex-col items-center justify-center p-4 lg:p-24 lg:pt-12 overflow-y-auto">
            <TransactionHistory bitcoiner={bitcoiner} currentBlockHeight={currentBlockHeight} handle={params.handle} searchParams={searchParams} />           
        </main>
    );
}