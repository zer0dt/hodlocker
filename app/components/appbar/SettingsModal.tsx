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

    const [bitcoinAmount, setBitcoinAmount] = useState('1000');
    const [blocksAmount, setBlocksAmount] = useState('0.01');

    const [isLoading, setIsLoading] = useState(false)

    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (bitcoinerSettings) {
            setBitcoinAmount(bitcoinerSettings.amountToLock.toString())
            setBlocksAmount(bitcoinerSettings.blocksToLock.toString())
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true)
        // Here you can use the bitcoinAmount and blocksAmount state variables
        console.log("Bitcoin amount:", bitcoinAmount);
        console.log("Blocks amount:", blocksAmount);

        if (handle && bitcoinAmount && blocksAmount) {
            // Call the server action to save the Bitcoiner settings
            try {
                const savedSettings = await saveBitcoinerSettings({
                    handle_id: handle, // Provide the Bitcoiner handle here
                    amountToLock: parseFloat(bitcoinAmount),
                    blocksToLock: parseInt(blocksAmount)
                });

                if (savedSettings) {
                    toast.success("Your default locking settings have been saved.")
                    setBitcoinerSettings({
                        handle_id: handle, // Provide the Bitcoiner handle here
                        amountToLock: parseFloat(bitcoinAmount),
                        blocksToLock: parseInt(blocksAmount)
                    })
                }

                setIsLoading(false)
                setSettingsModalVisible(false);
                router.refresh()
            } catch (error) {
                console.error('Error saving Bitcoiner settings:', error);
                // Handle the error, display a message to the user, etc.
            }
        }
    };


    return (

        <div id="crud-modal" ref={modalRef} tabIndex={-1} aria-hidden="true" className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden max-w-xs w-full">
                <div className="flex items-center justify-between p-4 md:p-5 border-b dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Default Lock Settings
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
                            <label htmlFor="bitcoin" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">bitcoin</label>
                            <input onClick={(e) => e.stopPropagation()} type="number" name="bitcoin" id="bitcoin" autoComplete="off" value={bitcoinAmount} step="any" onChange={e => setBitcoinAmount(e.target.value)} min={0.00000001} max={21} className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="0.01" required />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="blocks" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">blocks</label>
                            <input onClick={(e) => e.stopPropagation()} type="number" name="blocks" id="blocks" autoComplete="off" value={blocksAmount} onChange={e => setBlocksAmount(e.target.value)} min={1} className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="1000" required />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="submit" className="text-white inline-flex items-center bg-orange-400 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-400 dark:hover:bg-orange-600 dark:focus:ring-orange-300">
                            {isLoading && (
                                <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>
                            )}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default SettingsModal;