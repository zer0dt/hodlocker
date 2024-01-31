'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import { saveBitcoinerSettings } from '@/app/server-actions';
import { WalletContext } from '../../context/WalletContextProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SettingsModalProps {
    handle: string | null | undefined,
    setSettingsModalVisible: any
}

const SettingsModal = ({ handle, setSettingsModalVisible }: SettingsModalProps) => {
    const { bitcoinerSettings, setBitcoinerSettings } = useContext(WalletContext)!;
    const router = useRouter()

    const [bitcoinAmount, setBitcoinAmount] = useState<number>();
    const [blocksAmount, setBlocksAmount] = useState<number>();

    const modalRef = useRef(null);

    useEffect(() => {
        if (bitcoinerSettings) {
            setBitcoinAmount(bitcoinerSettings.amountToLock)
            setBlocksAmount(bitcoinerSettings.blocksToLock)
        }
    }, [bitcoinerSettings])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setSettingsModalVisible(false); // Close the modal when clicking outside
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleModal = () => {
        setSettingsModalVisible(false);
    };

    const handleBitcoinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBitcoinAmount(parseFloat(event.target.value));
    };

    const handleBlocksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBlocksAmount(parseInt(event.target.value));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Here you can use the bitcoinAmount and blocksAmount state variables
        console.log("Bitcoin amount:", bitcoinAmount);
        console.log("Blocks amount:", blocksAmount);

        if (handle && bitcoinAmount && blocksAmount) {
            // Call the server action to save the Bitcoiner settings
            try {
                const savedSettings = await saveBitcoinerSettings({
                    handle_id: handle, // Provide the Bitcoiner handle here
                    amountToLock: bitcoinAmount,
                    blocksToLock: blocksAmount
                });

                if (savedSettings) {
                    toast.success("Your default locking settings have been saved.")
                    setBitcoinerSettings({
                        handle_id: handle, // Provide the Bitcoiner handle here
                        amountToLock: bitcoinAmount,
                        blocksToLock: blocksAmount
                    })
                }

                router.refresh()
                setSettingsModalVisible(false);
            } catch (error) {
                console.error('Error saving Bitcoiner settings:', error);
                // Handle the error, display a message to the user, etc.
            }
        }
    };


    return (
        <>
            <div id="crud-modal" tabIndex={-1} aria-hidden="true" className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden max-w-sm w-full">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Default Locking Settings
                        </h3>
                        <button type="button" onClick={() => toggleModal()} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 md:p-5">
                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label htmlFor="bitcoin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">bitcoin</label>
                                <input type="number" name="bitcoin" id="bitcoin" value={bitcoinAmount} onChange={handleBitcoinChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0.01" required={true} />
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="blocks" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">blocks</label>
                                <input type="number" name="blocks" id="blocks" value={blocksAmount} onChange={handleBlocksChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="1000" required={true} />
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button type="submit" className="text-white inline-flex items-center bg-orange-400 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-400 dark:hover:bg-orange-600 dark:focus:ring-orange-300">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SettingsModal;