import React, { useEffect, useState } from 'react';

import Confetti from 'react-dom-confetti';
import { SiBitcoinsv } from 'react-icons/si';

const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 2920,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#f7931a", "#f7931a", "#f7931a"]
};

interface UnlockModalProps {
  unlockModalOpen: boolean,
  openModal: () => void;
  closeModal: () => void;
  checkingUnlocks: boolean;
  checkedTransactions: { txid: string; spent: boolean, amount: number }[];
  unlockAllDisabled: boolean;
  isUnlockingTx: boolean;
  unlockableTransactions: { txid: string; spent: boolean, amount: number }[];
  unlockTransactions: () => void;
  mnemonic: string;
  setMnemonic: React.Dispatch<React.SetStateAction<string>>;
  isExploding: boolean,
  handleExplosion: () => void
}

const unlockingSpinner = () => {
  return (
    <div role="status flex">
      <svg
        aria-hidden="true"
        className="ml-2 inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};


const UnlockModal = ({
  unlockModalOpen,
  closeModal,
  checkingUnlocks,
  checkedTransactions,
  unlockAllDisabled,
  setMnemonic,
  mnemonic,
  unlockableTransactions,
  unlockTransactions,
  isUnlockingTx,
  isExploding,
  handleExplosion
}: UnlockModalProps) => {

  const [totalUnspentTransactions, setTotalUnspentTransactions] = useState(0);
  const [totalAmountUnspentTransactions, setTotalAmountUnspentTransactions] = useState(0);

  useEffect(() => {
    // Calculate the quantity of unspent locklikes and their total amount
    const unspentTransactions = checkedTransactions.filter((tx) => !tx.spent);
    const totalUnspentTransactions = unspentTransactions.length;
    const totalAmountUnspentTransactions = unspentTransactions.reduce(
      (total, tx) => total + tx.amount,
      0
    );

    // Update state with the calculated values
    setTotalUnspentTransactions(totalUnspentTransactions);
    setTotalAmountUnspentTransactions(totalAmountUnspentTransactions);
  }, [checkedTransactions]); // Run this effect whenever checkedPosts changes

  useEffect(() => {
    if (isExploding) {

      // Set isExploding back to false after a brief delay (e.g., 2 seconds)
      const delay = 2000; // 2 seconds
      const timeoutId = setTimeout(() => {
        handleExplosion(); // Set isExploding to false
      }, delay);

      // Clear the timeout to avoid memory leaks
      return () => clearTimeout(timeoutId);
    }
  }, [isExploding]);

  return (
    unlockModalOpen && (
      <div
        tabIndex={-1}
        data-modal-backdrop="static"
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-gray-700 bg-opacity-70 pb-36"

      >
        {/* Modal overlay with the modalOverlayRef */}
        <div
          className="fixed top-0 left-0 right-0 bottom-0"
        />
        {/* Modal content with the modalContentRef */}
        <div id="defaultModal" className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Modal content */}
          <div className="relative">
            {/* Modal header */}
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Unlocking Status
              </h3>
              {!checkingUnlocks && (
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs w-6 h-6 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="defaultModal"
                  onClick={closeModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    {/* Close button SVG */}
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              )}
            </div>
            {/* Modal body */}
            <div className="p-4">
              <div className={`max-h-80 ${checkingUnlocks ? '' : 'overflow-y-auto'}`}>
                {checkingUnlocks ? (
                  <div className="flex items-center justify-center">
                    {unlockingSpinner()}
                    <span className="pl-2">
                      Checking Txs: {checkedTransactions.length} / {unlockableTransactions.length}
                    </span>
                  </div>
                ) : (
                  <div className="pl-4">
                    {/* Display the calculated values from state */}
                    <p>Unspent Txs: <b>{totalUnspentTransactions}</b></p>
                    <div className="flex justify-start items-center">
                      <p className="">Total Amount: <b>{totalAmountUnspentTransactions / 100000000}</b></p>
                      <SiBitcoinsv className="text-orange-400" />
                    </div>

                    <div className="pt-4">
                    {/* Display individual unspent locklikes */}
                    {checkedTransactions
                      .filter((tx) => !tx.spent) // Filter unspent locklikes
                      .map((tx, index) => (
                        <p
                          key={index}
                          className={`text-sm leading-relaxed ${tx.spent ? 'text-red-500' : 'text-green-500'
                            }`}
                        >
                          Transaction ID: <strong>{tx.txid.slice(0, 7) + '...'}</strong>
                          {tx.spent ? ' unlocked' : ' 🤑'}
                        </p>
                      ))}
                      </div>
                  </div>
                )}
              </div>
            </div>
            {!checkingUnlocks ? (
              <div className="px-2">
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  Enter your mnemonic to unlock all posts:
                </p>
                <input
                  type="text"
                  placeholder="Enter Mnemonic"
                  value={mnemonic}
                  onChange={(e) => {
                    e.preventDefault();
                    setMnemonic(e.target.value);
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs w-full"
                />
              </div>
            ) : null}
            {/* Modal footer */}
            <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button
                data-modal-hide="defaultModal"
                type="button"
                disabled={unlockAllDisabled}
                className={`${unlockAllDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300'
                  } text-white bg-blue-700 ${unlockAllDisabled
                    ? ''
                    : 'hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300'
                  } font-medium rounded-lg text-xs px-3 py-1 text-center ${unlockAllDisabled
                    ? 'dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                    : ''
                  }`}
                onClick={() => unlockTransactions()}
              >
                <Confetti active={isExploding} config={config} />
                {isUnlockingTx ? (
                  <>
                    <div className="flex">
                      Unlocking Txs
                    </div>
                  </>
                ) : (
                  <span>Unlock All</span>
                )}
              </button>
              {isUnlockingTx ? unlockingSpinner() : null}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default UnlockModal;
