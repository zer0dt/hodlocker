"use client";

import { useRouter, useParams } from "next/navigation";

import { useState, useEffect, useContext, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";

import { ImageUploader } from "../uploads/ImageUploader";

import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions";

import { toast } from "sonner";

import {
  postNewBitcoiner,
  postNewTransaction,
  getAllBitcoinerHandles,
  postLockLike,
} from "../../server-actions";

import { postAnon } from './anon-post-server-action'
import { getLockupScript } from "../../utils/scrypt";
import { bsv } from 'scrypt-ts'
import { WalletContext } from "../../context/WalletContextProvider";
import {
  DEFAULT_DEPLOY_POST_AMOUNT,
  DEFAULT_DEPLOY_POST_BLOCKS,
  DEFAULT_LOCKLIKE_AMOUNT,
  DEFAULT_LOCKLIKE_BLOCKS,
  LockInput,
} from "../LockInput";

interface deployProps {
  subs: {
    id: number;
    name: string;
  }[];
  closeDrawer: () => void;
  isDrawerVisible: boolean;
}

export default function DeployInteraction({
  subs,
  closeDrawer,
  isDrawerVisible,
}: deployProps) {
  const router = useRouter();
  const params = useParams();

  const {
    handle,
    paymail,
    pubkey,
    isLinked,
    fetchRelayOneData,
    currentBlockHeight,
    bitcoinerSettings,
    setSignInModalVisible,
  } = useContext(WalletContext)!;

  const [darkMode, setDarkMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const [note, setNote] = useState("");

  const amountToLock = DEFAULT_DEPLOY_POST_AMOUNT.toString()
  const blocksToLock = DEFAULT_DEPLOY_POST_BLOCKS
  const [addLockLike, setAddLockLike] = useState(false)
  const [amountToLockLike, setAmountToLockLike] = useState<string>(DEFAULT_LOCKLIKE_AMOUNT.toString());
  const [blocksToLockLike, setBlocksToLockLike] = useState<number>(DEFAULT_LOCKLIKE_BLOCKS);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | undefined>();

  const [anonMode, setAnonMode] = useState(false);
  const anonBlocksToLock = 36;

  const [mentionData, setMentionData] = useState<SuggestionDataItem[]>([]);

  const [sub, setSub] = useState<string | string[]>("BSV");
  const [subDropdownVisible, setSubDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  const handleSubClick = (subName: string) => {
    setSub(subName);
    setSubDropdownVisible(false);
  };

  const toggleAnonMode = (e) => {
    // When the checkbox changes, update anonMode based on its checked status
    if (e.target.checked) {
      // Check if the note contains a base64 string
      const base64Regex = /^(data:.*?;base64,)/;
      if (base64Regex.test(note)) {
        setNote("");
      }
    }
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
      if (localStorage.theme === "dark") {
        setDarkMode(true);
      }

      // Check if user has explicitly chosen light mode
      if (localStorage.theme === "light") {
        setDarkMode(false);
      }

      // Check for OS dark mode setting
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setDarkMode(true);
      }
    }
    isDarkMode();
  }, []);

  useEffect(() => {
    const fetchBitcoiners = async () => {
      const bitcoiners = await getAllBitcoinerHandles();
      if (bitcoiners) {
        // Transform the data to match the expected type
        const mentionData: SuggestionDataItem[] = bitcoiners.map(
          (bitcoiner: string) => ({
            id: bitcoiner, // Replace with the actual unique identifier
            display: bitcoiner,
          })
        );

        setMentionData(mentionData);
      }
    };

    fetchBitcoiners();
  }, []);

  useEffect(() => {
    if (params.ticker) {
      setSub(params.ticker);
    } else {
      setSub("BSV");
    }
  }, [params]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Click occurred outside the dropdown, close it
        setSubDropdownVisible(false);
      }
    };

    // Attach the event listener when the dropdown is visible
    if (subDropdownVisible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("click", handleClickOutside);
    };
  }, [subDropdownVisible]);

  const Post = async () => {
    setLoading(true);

    if (isLinked) {
      if (handle && pubkey) {
        postNewBitcoiner(handle, pubkey);
        console.log("using this pubkey to lock: ", pubkey);
      } else {
        setLoading(false);
        await fetchRelayOneData();
        return;
      }

      if (!pubkey) {
        alert("Public Key is missing!");
        setLoading(false);
        return;
      }

      if (currentBlockHeight) {
        console.log("current Block Height", currentBlockHeight);
        if (currentBlockHeight + blocksToLock <= currentBlockHeight || currentBlockHeight + blocksToLockLike <= currentBlockHeight) {
          alert("nLockTime should be greater than the current block height.");
          return; // Do not proceed with the locking process.
        }

        const nLockTime = currentBlockHeight + blocksToLock;

        console.log(parseFloat(amountToLock));

        if (parseFloat(amountToLock) * 100000000 > 2100000000 || parseFloat(amountToLockLike) * 100000000 > 2100000000) {
          alert("You cannot lock more than 21 bitcoin at this moment.");
          return;
        }

        console.log("content: ", note);
        console.log("paymail: ", paymail);
        setPaying(true);

        console.log("amount to lock: ", amountToLock);
        console.log(
          "locking for ",
          blocksToLock + " blocks, locked until " + nLockTime
        );

        if (nLockTime && pubkey && paymail) {
          const lockupScript = await getLockupScript(nLockTime, pubkey);

          const fullMessage = gifUrl ? note + " " + gifUrl : note;

          const noteOpReturn = [
            "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut",
            fullMessage,
            "text/markdown",
            "UTF-8",
            "|",
            "1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5",
            "SET",
            "app",
            "hodlocker.com",
            "type",
            "post",
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
              script: bsv.Script.buildSafeDataOut(noteOpReturn),
              satoshis: 0,
            })
          )

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
              console.log(send);
              toast(
                "Transaction posted on-chain: " +
                send.txid.slice(0, 6) +
                "..." +
                send.txid.slice(-6)
              );
              const newPost = await postNewTransaction(
                send.txid,
                parseFloat(amountToLock) * 100000000,
                send.paymail.substring(0, send.paymail.lastIndexOf("@")),
                fullMessage,
                nLockTime,
                sub,
                uploadedImage ? true : false
              );
              console.log(newPost);
              toast.success(
                "Transaction posted to hodlocker.com: " +
                newPost.txid.slice(0, 6) +
                "..." +
                newPost.txid.slice(-6)
              );
              if (newPost.txid && addLockLike) {  
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
                    toast("Transaction posted on-chain: " + sendLockLike.txid.slice(0, 6) + "..." + sendLockLike.txid.slice(-6))
                    const returnedLockLike = await postLockLike(
                        sendLockLike.txid,
                        parseFloat(amountToLockLike) * 100000000,
                        nLockTimeLockLike,
                        sendLockLike.paymail.substring(0, sendLockLike.paymail.lastIndexOf("@")),
                        postTxid
                    );
                    console.log(returnedLockLike)  
                    toast.success("Transaction posted to hodlocker.com: " + returnedLockLike.txid.slice(0, 6) + "..." + returnedLockLike.txid.slice(-6))
                    console.log("done with lock like!")
                  } catch (err) {
                    console.error("Error posting lock like:", err);
                    toast.error("Error posting lock like: " + err)
                    alert(err);
                  }
                }
              }
              setPaying(false);
              setLoading(false);
              setNote("");
              setUploadedImage(null);
              router.refresh();
              closeDrawer();
            } catch (err) {
              console.log(err);
              toast.error("Error posting to hodlocker.com: " + err);
            }
          }
        }
      }
    } else {
      setLoading(false);
      setSignInModalVisible(true);
      return;
    }
  };

  const AnonPost = async () => {
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

      const fullMessage = uploadedImage ? (note + " " + uploadedImage) : gifUrl ? (note + " " + gifUrl) : note;

      console.log("content: ", fullMessage);

      setPaying(true);

      console.log("amount to lock: ", amountToLock);
      console.log(
        "locking for ",
        blocksToLock + " blocks, locked until " + nLockTime
      );

      const deployedAnonPost = await postAnon(fullMessage, sub, amountToLock, nLockTime)

      if (deployedAnonPost) {

        toast.success(
          "Transaction posted to hodlocker.com: " +
          deployedAnonPost.txid.slice(0, 6) +
          "..." +
          deployedAnonPost.txid.slice(-6)
        );

        setPaying(false);
        setLoading(false);
        setNote("");
        setUploadedImage(null);
        router.refresh();
        closeDrawer();
      } else {
        setLoading(false);
        return;
      }
    }
  };

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
      <div className="z-10 flex flex-col -mt-6 justify-between">
        <button
          onClick={() => {
            setSubDropdownVisible(!subDropdownVisible);
          }}
          id="dropdownNavbarLink"
          data-dropdown-toggle="dropdownNavbar"
          className="flex items-center justify-start w-1/4 mb-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-gray-400 dark:hover:text-white dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
        >
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
            {sub}
          </span>
          <svg
            className="w-2.5 h-2.5 ml-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {subDropdownVisible && (
          <div
            id="dropdownNavbar"
            ref={dropdownRef}
            className="z-30 absolute top-4 left-2 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-400 overflow-y-auto max-h-40"
              aria-labelledby="dropdownLargeButton"
            >
              {subs.map((sub) => (
                <li key={sub.id}>
                  <h1
                    onClick={() => {
                      handleSubClick(sub.name);
                    }}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {sub.name}
                  </h1>
                </li>
              ))}
            </ul>
          </div>
        )}

        <MentionsInput
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoComplete="off"
          id="message"
          className={darkMode ? "dark-comments-textarea" : "comments-textarea"}
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

        <div className={`flex justify-between my-3 ${uploadedImage ? "flex-col-reverse" : ""}`}>
          <div className="flex">
            <div className="flex pl-2 items-center cursor-pointer">
              <input
                id="deploy-post-anon-mode-input"
                onChange={toggleAnonMode}
                type="checkbox"
                checked={anonMode}
                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="deploy-post-anon-mode-input"
                className="cursor-pointer flex w-max pl-2 text-sm font-mono text-gray-900 dark:text-gray-300"
              >
                anon mode
              </label>
            </div>
            <div className={`flex pl-2 items-center w-max`}>
              <input
                id="deploy-post-add-lock-input"
                disabled={anonMode}
                type="checkbox"
                onChange={toggleAddLockLike}
                checked={addLockLike}
                className="w-4 h-4 text-blue-600 bg-gray-100 disabled:bg-gray-50 border-gray-300 disabled:border-gray-200 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:disabled:bg-gray-800 dark:border-gray-600 dark:disabled:border-gray-700 cursor-pointer disabled:cursor-not-allowed"
              />
              <label
                htmlFor="deploy-post-add-lock-input"
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
                gifUrl={gifUrl}
                setGifUrl={setGifUrl}
                onImageUpload={handleImageUpload}
                isDrawerVisible={isDrawerVisible}
              />
            ) : null}
          </div>
        </div>

        {!anonMode && addLockLike && (
          <div className="flex w-3/4 mx-auto pb-5">
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
              onClick={anonMode ? AnonPost : Post}
              className="relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-orange-500 to-orange-400 group-hover:from-orange-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-orange-200 dark:focus:ring-orange-800"
              disabled={paying || loading}
            >
              {paying || loading ? <Spinner /> : 
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Post
                </span>}
            </button>
        </div>
      </div>
    </>
  );
}
