'use client'

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TbLockCheck, TbLockPlus } from 'react-icons/tb'

import { getLockupScript } from '../../utils/scrypt'

import { postNewBitcoiner } from '../../server-actions'
import { WalletContext } from '../../context/WalletContextProvider';
import { LockLikes } from '@prisma/client';

import { toast } from 'sonner';
import { DEFAULT_LOCKLIKE_AMOUNT, DEFAULT_LOCKLIKE_BLOCKS, LockInput } from '../LockInput';


interface LockLikeInteractionProps {
    postTxid: string | undefined;
    replyTxid: string | undefined;
    postLockLike: (
      txid: string,
      amount: number,
      nLockTime: number,
      handle: string, 
      postTxid?: string,
      replyTxid?: string) => Promise<LockLikes>
}

export default function LockLikeInteraction({ postTxid, replyTxid, postLockLike }: LockLikeInteractionProps) {    
    const { currentBlockHeight, pubkey, fetchRelayOneData, handle, isLinked, bitcoinerSettings, setSignInModalVisible } = useContext(WalletContext)!;

    const router = useRouter()

    const [blocksToLock, setBlocksToLock] = useState(DEFAULT_LOCKLIKE_BLOCKS.toString())
    const [amountToLock, setAmountToLock] = useState(DEFAULT_LOCKLIKE_AMOUNT.toString())

    const [loading, setLoading] = useState(false)

    const [popoverVisible, setPopoverVisible] = useState<boolean>(false)
    const popoverRef = useRef(null);

    const [lockLiked, setLockLiked] = useState(false)

    useEffect(() => {
      if (bitcoinerSettings) {
        setAmountToLock(bitcoinerSettings.amountToLock.toString())
        setBlocksToLock(bitcoinerSettings.blocksToLock.toString())
      }
    }, [bitcoinerSettings])
 

    useEffect(() => {
      function handleClickOutside(event) {
        if (popoverVisible && popoverRef.current && !popoverRef.current.contains(event.target)) {
          setPopoverVisible(false);
        }
      }
    
      document.addEventListener("mousedown", handleClickOutside);
    
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popoverVisible]);
    
    
    const handleLockLike = async () => {
      setLoading(true)

      if (isLinked) {
        if (handle && pubkey) {
          postNewBitcoiner(handle, "", pubkey, null) 
          console.log("using this pubkey to locklike: ", pubkey)         
        } else {          
          setLoading(false)
          await fetchRelayOneData()
          return
        }  
        
        if (!pubkey) {
          alert('Public Key is missing!');
          setLoading(false)
          return;
        }
  
        if (currentBlockHeight) {
          console.log("current Block Height", currentBlockHeight)
          if ((currentBlockHeight + Number(blocksToLock)) <= currentBlockHeight) {
            alert('nLockTime should be greater than the current block height.')        
            setBlocksToLock(DEFAULT_LOCKLIKE_BLOCKS.toString())
            setLoading(false)
            return;  // Do not proceed with the locking process.
          } 
  
          const nLockTime = currentBlockHeight + Number(blocksToLock)
  
          console.log(parseFloat(amountToLock))
  
          if ((parseFloat(amountToLock) * 100000000) > 2100000000) {
            alert("You cannot lock more than 21 bitcoin at this moment.")
            setLoading(false)
            return;
          } 
          
          console.log("amount to locklike: ", amountToLock)
          console.log("locking for ", blocksToLock + " blocks, locked until " + nLockTime)
          
          if (nLockTime && pubkey) {
            const lockupScript = await getLockupScript(nLockTime, pubkey);
  
            const send = await relayone.send({
              to: lockupScript,
              amount: amountToLock,
              currency: "BSV",
              opReturn: [
                  "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5",
                  "SET",
                  "app",
                  "hodlocker.com",
                  "type",
                  "like",
                  "tx",
                  postTxid ? postTxid : replyTxid
              ]
            }).catch(e => {
                console.log(e.message);
                toast.error("An error has occurred: " + e.message)
                setLoading(false)
            });
  
            if (send) {
              try {
                toast("Transaction posted on-chain: " + send.txid.slice(0, 6) + "..." + send.txid.slice(-6))
                const returnedLockLike = await postLockLike(
                    send.txid,
                    parseFloat(amountToLock) * 100000000,
                    nLockTime,
                    send.paymail.substring(0, send.paymail.lastIndexOf("@")),
                    postTxid,
                    replyTxid
                );
                console.log(returnedLockLike)  
                toast.success("Transaction posted to hodlocker.com: " + returnedLockLike.txid.slice(0, 6) + "..." + returnedLockLike.txid.slice(-6))
  
                console.log("done with lock like!")

                setLoading(false)
                setPopoverVisible(false)
                setLockLiked(true) 

                router.refresh()
       
              } catch (err) {
                console.error("Error posting lock like:", err);
                toast.error("An error has occurred: " + err)
                alert(err);
                setLoading(false)
              }
            }
          }     
        }  
      } else {
        setLoading(false)
        setSignInModalVisible(true)
        return
      }     
    }

    return (
        <div className="flex gap-0 relative items-center">
            {loading ? 
              <div role="status">
                <svg aria-hidden="true" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
                :
                <>
                  {lockLiked ? 
                    <TbLockCheck                         
                        className="lock-icon h-6 w-6 cursor-pointer mr-0 text-orange-400"
                        onClick={(e) => { e.stopPropagation(); setPopoverVisible(true); }}   
                    /> 
                    :
                    <TbLockPlus         
                      className="lock-icon h-6 w-6 cursor-pointer mr-0"
                      onClick={(e) => { e.stopPropagation(); setPopoverVisible(true); }}
                    />
                  }                    
                    <div ref={popoverRef} className={`absolute top-30 left-5 z-50 shadow-2xl flex flex-col gap-5 w-64 text-sm text-gray-500 transition-opacity duration-300 ${popoverVisible ? 'opacity-100 visible' : 'opacity-0 invisible'} bg-white border border-gray-200 rounded-lg shadow-2xl dark:text-gray-400 dark:border-gray-600 dark:bg-black flex flex-col items-center`}>
                      <div className="pt-4">
                      <LockInput
                        setBitcoinAmount={setAmountToLock}
                        bitcoinAmount={amountToLock}
                        blocksAmount={blocksToLock}
                        setBlocksAmount={setBlocksToLock}
                      />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLockLike(); setPopoverVisible(false); }}
                        className={"transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-gradient-to-br hover:from-orange-300 hover:to-orange-600 shadow-lg shadow-orange-500/50 duration-300 inline-block rounded-md border border-transparent bg-gradient-to-br from-orange-300 to-orange-600 py-2 px-4 mb-4 text-sm font-medium text-white hover:bg-opacity-100"}
                      >
                        lock
                      </button>
                  </div>

                </>
            }
        </div>
    );
}