
import React from 'react'
import TransactionHistory from "./TransactionHistory";
import { getBitcoinerUnlockables } from './getBitcoinerUnlockables';
import { fetchCurrentBlockHeight } from '@/app/server-actions';


export default async function HandleDetails({params}: {params: {handle: string}}) { 
    const bitcoiner = await getBitcoinerUnlockables(params.handle);
    const currentBlockHeight = await fetchCurrentBlockHeight();
    
      return (
        <main className="flex flex-col items-center justify-center p-4 lg:p-24 lg:pt-12 overflow-y-auto">
            <TransactionHistory bitcoiner={bitcoiner} currentBlockHeight={currentBlockHeight} handle={params.handle} />           
        </main>
    );
}