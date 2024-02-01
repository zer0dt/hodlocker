'use client'

import { useRouter } from 'next/navigation';

import { useState, useEffect, useContext, useRef } from 'react'
import { ThreeDots } from 'react-loader-spinner'

import { ImageUploader } from '../uploads/ImageUploader'

import { postNewBitcoiner, postNewReply, HODLTransactions, getAllBitcoinerHandles } from '../../server-actions'
import { postAnonReply } from "./anon-reply-server-action"
import { getLockupScript } from '../../utils/scrypt';
import { WalletContext } from '../../context/WalletContextProvider';

import { toast } from 'sonner';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { bsv } from 'scrypt-ts';
import { RiSendPlane2Line } from 'react-icons/ri';


interface deployProps {
  transaction: HODLTransactions
}


export default function replyInteraction({ transaction }: deployProps) {
  const router = useRouter();

  const { handle, paymail, pubkey, isLinked, fetchRelayOneData, currentBlockHeight } = useContext(WalletContext)!;

  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)

  const [note, setNote] = useState('');
  const [amountToLock, setAmountToLock] = useState<string>('0.00000001');
  const [blocksToLock, setBlocksToLock] = useState<number>(144);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [anonMode, setAnonMode] = useState(false);
  const anonBlocksToLock = 36

  const [mentionData, setMentionData] = useState<SuggestionDataItem[]>([])

  const [darkMode, setDarkMode] = useState(false)

  const handleCheckboxChange = (e) => {
    // When the checkbox changes, update anonMode based on its checked status
    setAnonMode(e.target.checked);
  };

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

  const Lock = async () => {
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
        if ((currentBlockHeight + blocksToLock) <= currentBlockHeight) {
          alert('nLockTime should be greater than the current block height.')
          setBlocksToLock(1000)
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
              toast("Transaction posted on-chain: " + send.txid.slice(0, 6) + "..." + send.txid.slice(-6))
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
              toast.success("Transaction posted to hodlocker.com: " + newReply.txid.slice(0, 6) + "..." + newReply.txid.slice(-6))

              setPaying(false)
              setLoading(false)
              setNote('')
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
    }
  }

  const AnonLock = async () => {
    setLoading(true);
    console.log("posting in anon mode");

    if (currentBlockHeight) {
      console.log("current Block Height", currentBlockHeight);
      if (currentBlockHeight + anonBlocksToLock <= currentBlockHeight) {
        alert("nLockTime should be greater than the current block height.");
        setBlocksToLock(1000);
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

  const spinner = () => {
    return (
      <ThreeDots
        height="1em"
        width="1em"
        radius="4"
        color="#f97316"
        ariaLabel="three-dots-loading"
        wrapperStyle={{}}
        visible={true}
      />
    )
  }

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

            <div className="flex flex-col justify-start items-center">
              <button
                onClick={() => {
                  {
                    anonMode ? AnonLock() : Lock();
                  }
                }}
                className="pl-4 text-lg transition ease-in-out delay-150 hover:scale-150 inline-flex justify-center p-2 text-orange-500 rounded-lg cursor-pointer hover:text-orange-500 hover:bg-transparent dark:text-orange-500 dark:hover:text-white dark:bg-transparent dark:hover:bg-transparent"
              >
                {(paying || loading) ? spinner() : (
                  <RiSendPlane2Line />
                )}

              </button>
            </div>
          </div>
        </div>

        <div className="flex z-20 justify-between mb-0 pt-2 pl-4">
          <div className="flex mb-0 pl-2 mt-1 justify-start">
            <input
              id="default-checkbox"
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={anonMode}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="default-checkbox"
              className="ml-2 text-sm font-mono text-gray-900 dark:text-gray-300"
            >
              anon mode
            </label>
          </div>

          <div className="flex justify-end w-2/3 items-center mt-0 mb-0 pb-0">
            {isLinked ?
              <ImageUploader
                isDrawerVisible={false}
                onImageUpload={handleImageUpload}
              /> : null
            }
          </div>
        </div>
      </div>

    </>
  )
} 
