"use client";

import React, { useEffect, useState } from "react";

import { callRedeem } from "@/app/components/scrypt";

import {
  checkIfSpent,
  HODLBitcoiners,
} from "../../../server-actions";

import Link from "next/link";
import { HiSwitchHorizontal } from "react-icons/hi";
import UnlockModal from "./UnlockModal";
import UnlockableList from "./UnlockableList";

interface HistoryProps {
  bitcoiner: HODLBitcoiners;
  currentBlockHeight: number;
  handle: string;
}

const TransactionHistory = ({ bitcoiner, currentBlockHeight, handle }: HistoryProps) => {
  const [mnemonic, setMnemonic] = useState("");

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const [isExploding, setIsExploding] = useState(false);

  // Function to open the modal
    const openModal = () => {
        setUnlockModalOpen(true);
    };
    
    // Function to close the modal
    const closeModal = () => {
        setUnlockModalOpen(false);
    };


  const [unlockableTransactions, setUnlockableTransactions] = useState<[]>(
    []
  );


  const [checkedTransactions, setCheckedTransactions] = useState<
    { txid: string; spent: boolean, amount: number }[]
  >([]);

  const [unlockAllDisabled, setUnlockAllDisabled] = useState(true);

  const [isUnlockingTx, setIsUnlockingTx] = useState<boolean>(false);

  const [checkingUnlocks, setCheckingUnlocks] = useState<boolean>(false);

 
  useEffect(() => {
    if (currentBlockHeight) {
        const unlockPosts = bitcoiner.transactions.filter((transaction) => {
            return transaction.locked_until <= currentBlockHeight;
        });

        const unlockLockLikes = bitcoiner.locklikes.filter((locklike) => {
            return locklike.locked_until <= currentBlockHeight;
        });
        
        const combinedUnlockables = [...unlockPosts, ...unlockLockLikes];

        setUnlockableTransactions(combinedUnlockables);
    }
}, []);
    


  const handleExplosion = () => {
    if (isExploding == false) {
        setIsExploding(true)
    } else {
        setIsExploding(false)
    }    
  }


  function sortTransactionsByAmount(transactions) {
    // Use the sort method to sort the transactions by amount in ascending order
    transactions.sort((a, b) => b.amount - a.amount);
    return transactions;
  }

  const checkUnlocks = async () => {
    if (bitcoiner && currentBlockHeight) {
      // Open the modal
      openModal();

      setCheckingUnlocks(true);

      const checkingTxs: { txid: string; spent: boolean, amount: number }[] = [];

      for (const transaction of unlockableTransactions) {
        const spent = await checkIfSpent(handle, transaction.txid);

        checkingTxs.push({
          txid: transaction.txid,
          spent: spent,
          amount: transaction.amount
        });

        // Update the state to show progress in the modal
        setCheckedTransactions([...checkingTxs]);
      }

      setUnlockAllDisabled(false);
      setCheckingUnlocks(false);
    }
  };

  const unlockTransactions = async () => {
    setIsUnlockingTx(true);

    const result = await callRedeem(
      handle,
      currentBlockHeight,
      checkedTransactions,
      mnemonic
    );

    console.log("result", result)
    result && handleExplosion()
    setIsUnlockingTx(false);   

  };


  const spinner = () => {
    return (
      <div className="text-center">
            <div role="status">
                <svg aria-hidden="true" className="mt-8 inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
      </div>
    )
  }    

  
  return (
    <div className="pb-24">
        <div className="flex font-semibold items-center justify-center"> {/* Add items-center for vertical alignment */}
            <h1 className="text-3xl text-l font-normal pr-4">
                    unlockable txs
            </h1>
        </div>       

      <div className="flex pr-2 pt-8 justify-between items-center">       
        <Link href={"/" + handle + "/history" + "/locked"}>
            <HiSwitchHorizontal className="pl-2 w-8 h-8" />
        </Link>
        {bitcoiner && (
          <button
            onClick={checkUnlocks}
            className="mb-2 justify-end items-center transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-orange-500 duration-300 inline-block rounded-md border border-transparent bg-orange-500 shadow-md shadow-orange-500/50 dark:shadow-md dark:shadow-orange-800/80 mt-0 py-2 px-2 text-base font-medium text-white hover:bg-opacity-100"
          >
            <b>unlock all</b>
          </button>
        )}

      </div>

      { 
        currentBlockHeight === undefined ? (
          spinner()
        ) : (
          <>
            {unlockableTransactions.length === 0 ? (
              <p className="px-8 py-4"><b>No Unlockable Transactions</b></p>
            ) : (
              (
                <UnlockableList unlockableTransactions={sortTransactionsByAmount(unlockableTransactions)} currentBlockHeight={currentBlockHeight} />
              )
            )}
          </>
        )
      }
            
      <UnlockModal
        unlockModalOpen={unlockModalOpen}
        openModal={openModal}
        closeModal={closeModal}
        checkingUnlocks={checkingUnlocks}
        checkedTransactions={checkedTransactions}
        unlockAllDisabled={unlockAllDisabled}
        isUnlockingTx={isUnlockingTx}
        unlockTransactions={unlockTransactions}
        mnemonic={mnemonic}
        setMnemonic={setMnemonic}
        unlockableTransactions={unlockableTransactions}
        isExploding={isExploding}
        handleExplosion={handleExplosion}
      />      
    </div>    
  );
};

export default TransactionHistory;
