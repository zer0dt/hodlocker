
import { Alumni_Sans } from 'next/font/google'

import React, { Suspense } from 'react';
import Link from 'next/link'

import BitcoinLocked from './BitcoinLocked'
import UserBalance from './UserBalance';
import { SiBitcoinsv } from 'react-icons/si';


const inter = Alumni_Sans({ subsets: ['latin'] })


export default async function NavBar() {  

  const fallback = () => {
    return (
      <span id="badge-dismiss-dark" className="inline-flex items-center px-2 py-1 mr-1 text-sm font-medium text-black bg-gray-100 rounded dark:bg-gray-700 dark:text-white">
            <span className="text-md font-mono">total locked - 0000.00</span>
            <SiBitcoinsv className="text-orange-400 ml-1 mr-1" />
        </span>
    )
  }

  return (
    <>
      <nav className="bg-gray border-gray-200">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
          <Link href="/" className="flex-1 flex justify-start lg:justify-start items-center lg:px-16">
            <h1 className={inter.className}><span className="pl-4 text-4xl font-bold dark:text-white">HL</span></h1>
          </Link>

          
            <div className="flex flex-col justify-center">
              <div>
                <Suspense fallback={fallback()} >
                <BitcoinLocked />
                </Suspense>                
              </div>
            </div>
       

          <div className="flex-1 flex justify-end items-center md:order-2 md:pt-2 lg:mr-36">
            <UserBalance />
          </div>
        </div>
      </nav>


    </>
  );
}

