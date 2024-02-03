'use client'

import { useRouter } from 'next/navigation';

import { useState, useEffect, useContext, useRef } from 'react'
import { ThreeDots } from 'react-loader-spinner'

import { ImageUploader } from '../uploads/ImageUploader'

import { postNewBitcoiner, postNewReply, HODLTransactions, getAllBitcoinerHandles, postLockLike } from '../../server-actions'
import { postAnonReply } from "./anon-reply-server-action"
import { getLockupScript } from '../../utils/scrypt';
import { WalletContext } from '../../context/WalletContextProvider';

import { toast } from 'sonner';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { bsv } from 'scrypt-ts';
import { DEFAULT_DEPLOY_POST_AMOUNT, DEFAULT_DEPLOY_POST_BLOCKS, DEFAULT_LOCKLIKE_AMOUNT, DEFAULT_LOCKLIKE_BLOCKS, LockInput } from '../LockInput';


interface deployProps {
  transaction: HODLTransactions
}


export default function replyInteraction({ transaction }: deployProps) {
  const router = useRouter();

  const { handle, paymail, pubkey, isLinked, fetchRelayOneData, currentBlockHeight, setSignInModalVisible, bitcoinerSettings } = useContext(WalletContext)!;

  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)

  const [note, setNote] = useState('');
  const amountToLock = DEFAULT_DEPLOY_POST_AMOUNT.toFixed(8)
  const blocksToLock = DEFAULT_DEPLOY_POST_BLOCKS
  const [amountToLockLike, setAmountToLockLike] = useState<string>(DEFAULT_LOCKLIKE_AMOUNT.toString());
  const [blocksToLockLike, setBlocksToLockLike] = useState<number>(DEFAULT_LOCKLIKE_BLOCKS);
  const [addLockLike, setAddLockLike] = useState(false)

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [anonMode, setAnonMode] = useState(false);
  const anonBlocksToLock = 36

  const [mentionData, setMentionData] = useState<SuggestionDataItem[]>([])

  const [darkMode, setDarkMode] = useState(false)

  const toggleAnonMode = (e) => {
    // When the checkbox changes, update anonMode based on its checked status
    setAnonMode(e.target.checked);
  };

  const toggleAddLockLike = () => {
    setAddLockLike(prev => !prev)
  }

  useEffect(() => {
    if (anonMode) {
      setAddLockLike(false)
    }
  }, [anonMode])

  useEffect(() => {
    if (bitcoinerSettings) {
      setAmountToLockLike(bitcoinerSettings.amountToLock.toString());
      setBlocksToLockLike(bitcoinerSettings.blocksToLock);
    } else {
      setAmountToLockLike(DEFAULT_LOCKLIKE_AMOUNT.toString());
      setBlocksToLockLike(DEFAULT_LOCKLIKE_BLOCKS);
    }
  }, [bitcoinerSettings]);

  useEffect(() => {
    function isDarkMode() {
      // Check if user has explicitly chosen dark mode
      if (localStorage.theme === 'dark') {
        setDarkMode(true)
      }

      // Check if user has explicitly chosen light mode
      if (localStorage.theme === 'light') {
        setDarkMode(false)
      }

      // Check for OS dark mode setting
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true)
      }
    }
    isDarkMode()
  }, [])

  useEffect(() => {
    const fetchBitcoiners = async () => {
      const bitcoiners = await getAllBitcoinerHandles()
      if (bitcoiners) {
        // Transform the data to match the expected type
        const mentionData: SuggestionDataItem[] = bitcoiners.map((bitcoiner: string) => ({
          id: bitcoiner, // Replace with the actual unique identifier
          display: bitcoiner
        }));

        setMentionData(mentionData)
      }
    }

    fetchBitcoiners()
  }, [])

  const Reply = async () => {
    setLoading(true)

    if (isLinked) {
      if (handle && pubkey) {
        postNewBitcoiner(handle, pubkey)
        console.log("using this pubkey to lock: ", pubkey)
      } else {
        alert('RelayX not connected yet.')
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
        if (currentBlockHeight + blocksToLock <= currentBlockHeight || currentBlockHeight + blocksToLockLike <= currentBlockHeight) {
          alert('nLockTime should be greater than the current block height.')
          return;  // Do not proceed with the locking process.
        }

        const nLockTime = currentBlockHeight + blocksToLock

        console.log(parseFloat(amountToLock))

        if ((parseFloat(amountToLock) * 100000000) > 2100000000) {
          alert("You cannot lock more than 21 bitcoin at this moment.")
          return;
        }

        console.log("content: ", note)
        console.log("paymail: ", paymail)
        setPaying(true)

        console.log("amount to lock: ", amountToLock)
        console.log("locking for ", blocksToLock + " blocks, locked until " + nLockTime)

        if (nLockTime && pubkey && paymail) {
          const lockupScript = await getLockupScript(nLockTime, pubkey)

          const replyOpReturn = [
            "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut",
            note,
            "text/markdown",
            "UTF-8",
            "|",
            "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5",
            "SET",
            "app",
            "hodlocker.com",
            "type",
            "post",
            "context",
            "tx",
            "tx",
            transaction.txid,
            "paymail",
            paymail
          ]

          const tx = new bsv.Transaction();

          tx.addOutput(
            new bsv.Transaction.Output({
              script: bsv.Script.fromASM(lockupScript),
              satoshis: parseFloat(amountToLock) * 100000000,
            })
          )

          tx.addOutput(
            new bsv.Transaction.Output({
              script: bsv.Script.buildSafeDataOut(replyOpReturn),
              satoshis: 0,
            })
          )

          let imageOpReturn;
          if (uploadedImage) {

            const imageOpReturn = [
              uploadedImage
            ]
            
            tx.addOutput(
              new bsv.Transaction.Output({
                script: bsv.Script.buildSafeDataOut(imageOpReturn),
                satoshis: 0,
              })
            )
          }

          const serializedTx = tx.toString();

          const send = await relayone
            .send(serializedTx)
            .catch((e) => {
              console.log(e.message);
              toast.error("An error occurred: " + e.message);
              setLoading(false);
            });

          if (send) {
            try {
              console.log(send)
              toast("Reply posted on-chain: " + send.txid.slice(0, 6) + "..." + send.txid.slice(-6))
              const newReply = await postNewReply(
                send.txid,
                parseFloat(amountToLock) * 100000000,
                transaction.txid,
                send.paymail.substring(0, send.paymail.lastIndexOf("@")),
                note,
                nLockTime,
                uploadedImage ? true : false
              )
              console.log(newReply)
              toast.success("Reply posted to hodlocker.com: " + newReply.txid.slice(0, 6) + "..." + newReply.txid.slice(-6))
              if (newReply.txid && addLockLike) {  
                const postTxid = send.txid
                const nLockTimeLockLike = currentBlockHeight + blocksToLockLike;
                console.log("lockliking", amountToLockLike, "for", blocksToLockLike + "blocks until", nLockTimeLockLike)
                const lockupScript = await getLockupScript(nLockTimeLockLike, pubkey);
                const sendLockLike = await relayone.send({
                  to: lockupScript,
                  amount: amountToLockLike,
                  currency: "BSV",
                  opReturn: [
                      "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5",
                      "SET",
                      "app",
                      "hodlocker.com",
                      "type",
                      "like",
                      "tx",
                      postTxid
                  ]
                }).catch(e => {
                    console.error(e.message);
                    toast.error("Error broadcasting locklike: " + e.message)
                    setLoading(false)
                });
                if (sendLockLike) {
                  try {
                    toast("Lock posted on-chain: " + sendLockLike.txid.slice(0, 6) + "..." + sendLockLike.txid.slice(-6))
                    const returnedLockLike = await postLockLike(
                        sendLockLike.txid,
                        parseFloat(amountToLockLike) * 100000000,
                        nLockTimeLockLike,
                        sendLockLike.paymail.substring(0, sendLockLike.paymail.lastIndexOf("@")),
                        undefined,
                        postTxid,
                    );
                    console.log(returnedLockLike)  
                    toast.success("Lock posted to hodlocker.com: " + returnedLockLike.txid.slice(0, 6) + "..." + returnedLockLike.txid.slice(-6))
                    console.log("done with lock like!")
                  } catch (err) {
                    console.error("Error posting lock like:", err);
                    toast.error("Error posting lock like: " + err)
                    alert(err);
                  }
                }
              }
              setPaying(false)
              setLoading(false)
              setNote('')
              setUploadedImage(null)
              router.refresh()
            } catch (err) {
              alert(err)
            }
          }
        }
      }
    } else {
      setPaying(false)
      setLoading(false)
      setSignInModalVisible(true)
    }
  }

  const AnonReply = async () => {
    setLoading(true);
    console.log("posting in anon mode");

    if (currentBlockHeight) {
      console.log("current Block Height", currentBlockHeight);
      if (currentBlockHeight + anonBlocksToLock <= currentBlockHeight) {
        alert("nLockTime should be greater than the current block height.");
        return; // Do not proceed with the locking process.
      }

      const nLockTime = currentBlockHeight + anonBlocksToLock;

      console.log(parseFloat(amountToLock));

      if (parseFloat(amountToLock) * 100000000 > 2100000000) {
        alert("You cannot lock more than 21 bitcoin at this moment.");
        return;
      }

      console.log("content: ", note);

      setPaying(true);

      console.log("amount to lock: ", amountToLock);
      console.log(
        "locking for ",
        blocksToLock + " blocks, locked until " + nLockTime
      );

      const deployedAnonReply = await postAnonReply(transaction.txid, note, amountToLock, nLockTime)

      if (deployedAnonReply) {

        toast.success(
          "Transaction posted to hodlocker.com: " +
          deployedAnonReply.txid.slice(0, 6) +
          "..." +
          deployedAnonReply.txid.slice(-6)
        );

        setPaying(false);
        setLoading(false);
        setNote("");
        setUploadedImage(null);
        router.refresh();
      } else {
        setLoading(false);
        return;
      }
    }
  }

  const Spinner = () => {
    return (
      <>
        <div className="justify-center items-center flex p-2">
          <ThreeDots
            height="2em"
            width="2em"
            radius="4"
            color="#FFFFFF"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            visible={true}
          />
        </div>
      </>
    );
  };

  const handleImageUpload = (dataURL: string | null) => {
    if (dataURL) {
      setUploadedImage(dataURL);
    } else {
      setUploadedImage(null);
    }
  };

  
  return (
    <>
      <div className="flex flex-col pt-4">
        <div className="rounded-lg w-full flex justify-start items-center bg-white dark:bg-black">
          <div className="flex w-full justify-center items-center pl-4">
            <MentionsInput
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoComplete="off"
              id="message"
              className={darkMode ? "dark-comments-textarea w-11/12" : "comments-textarea w-11/12"}
              placeholder="What's up?"
            >
              <Mention
                trigger="@"
                data={mentionData}
                displayTransform={(display) => `@${display}`}
                markup="[@__display__]"
                appendSpaceOnAdd={true}
              />
            </MentionsInput>
          </div>
        </div>
      </div>
      <div className={`flex justify-between my-3 ${uploadedImage ? "flex-col-reverse" : ""}  w-10/12 mx-auto`}>
          <div className="flex">
            <div className="flex pl-2 items-center cursor-pointer">
              <input
                id="deploy-reply-anon-mode-input"
                onChange={toggleAnonMode}
                type="checkbox"
                checked={anonMode}
                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="deploy-reply-anon-mode-input"
                className="cursor-pointer flex w-max pl-2 text-sm font-mono text-gray-900 dark:text-gray-300"
              >
                anon mode
              </label>
            </div>
            <div className={`flex pl-2 items-center w-max`}>
              <input
                id="deploy-reply-add-lock-input"
                disabled={anonMode}
                type="checkbox"
                onChange={toggleAddLockLike}
                checked={addLockLike}
                className="w-4 h-4 text-blue-600 bg-gray-100 disabled:bg-gray-50 border-gray-300 disabled:border-gray-200 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:border-gray-600 dark:disabled:border-gray-700 cursor-pointer disabled:cursor-not-allowed"
              />
              <label
                htmlFor="deploy-reply-add-lock-input"
                className={`flex w-max pl-2 text-sm font-mono 
                  ${anonMode ? "dark:text-gray-400" : "dark:text-gray-300"} 
                  ${anonMode ? "text-gray-400" : "text-gray-900"}
                  ${anonMode ? "cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                add lock
              </label>
            </div>
          </div>
          <div className={`flex ${uploadedImage ? "justify-center" : "justify-end"} w-full items-center mt-0 mb-0 pb-0"`}>
            {isLinked ? (
              <ImageUploader
                onImageUpload={handleImageUpload}
                isDrawerVisible={true}
                gifUrl={undefined}
                setGifUrl={() => undefined}
              />
            ) : null}
          </div>
        </div>

        {!anonMode && addLockLike && (
          <div className="w-3/4 flex mx-auto pb-5">
            <LockInput
              bitcoinAmount={amountToLockLike}
              setBitcoinAmount={setAmountToLockLike}
              blocksAmount={blocksToLockLike.toString()}
              setBlocksAmount={(value) => setBlocksToLockLike(parseFloat(value))}
              isDisabled={anonMode}
            />
          </div>
        )}

        <div className="flex justify-center items-center -mb-4">
            <button
              onClick={anonMode ? AnonReply : Reply}
              className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-orange-500 to-orange-400 group-hover:from-orange-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-orange-200 dark:focus:ring-orange-800"
              disabled={paying || loading}
            >
              {paying || loading ? <Spinner /> : 
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Comment
                </span>}
            </button>
        </div>
    </>
  )
} 
