'use client'

import React, { useState, useEffect, useContext } from 'react';
import { WalletContext } from '../context/WalletContextProvider';

function Disclaimer() {
    const { pubkey } = useContext(WalletContext)!;
    
    // Using useState to control modal visibility
    const [showModal, setShowModal] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        // Check local storage when the component mounts
        const dontShowModal = localStorage.getItem('dontShowModal');
        if (!dontShowModal && pubkey) {  // If the flag is absent, show the modal
            setShowModal(true);
        }
    }, []);

    const handleAcknowledge = () => {
        if (dontShowAgain) {
            // Save to local storage if "don't show again" is checked
            localStorage.setItem('dontShowModal', 'true');
        }
        setShowModal(false);
    }


    return (
        <div>
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                {/* Your modal content goes here */}
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Disclaimer</h3>
                                <div className="mt-2">
                                    <p className="text-sm leading-5 text-gray-500">
                                        Please be reminded that we accept no responsibility for any financial losses occurred to users as a result of using this app. Use at your own risk.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <label className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox"
                                        checked={dontShowAgain}
                                        onChange={() => setDontShowAgain(!dontShowAgain)}
                                    />
                                    <span className="ml-2 pr-2 text-gray-500">Don't show this again</span>
                                </label>
                            </div>
                            <div className="mt-5 sm:mt-6 text-center">
                                <span className="flex w-full rounded-md shadow-sm">
                                    <button 
                                        type="button" 
                                        className="mx-auto w-1/2 inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5" 
                                        onClick={handleAcknowledge}>
                                        Acknowledge
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Other components or contents of the page go here */}
        </div>
    );
}

export default Disclaimer;
