'use client'

import React from 'react'

import { RWebShare } from "react-web-share";
import { TbShare2 } from "react-icons/tb";

import { HODLTransactions } from "../../server-actions";

interface WebShareProps {
    transaction: HODLTransactions
}

export default function WebShare({ transaction }: WebShareProps) {

    return (
        <RWebShare
                data={{
                  text:
                    transaction.handle_id +
                    " locked up " +
                    transaction.amount / 100000000 +
                    " bitcoin on hodlocker.com",
                  url:
                    "https://www.hodlocker.com/" +
                    transaction.handle_id +
                    "/post/" +
                    transaction.txid,
                  title:
                    "https://www.hodlocker.com/" +
                    transaction.handle_id +
                    "/post/" +
                    transaction.txid,
                }}
              >
                <TbShare2 className="h-5 w-5 text-black dark:text-white" />
              </RWebShare>
    )
}