'use client'

import React from 'react';

import { SiBitcoinsv } from 'react-icons/si';


export default function BitcoinLocked({ bitcoinLocked }: {bitcoinLocked: number}) {


    console.log(bitcoinLocked.toFixed(2))

  return (
        <>
            <span className="text-md font-mono">total locked - {Number(bitcoinLocked).toFixed(2)}</span>
            <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
        </>

    );
}

