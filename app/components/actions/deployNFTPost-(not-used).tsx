"use client";

import { useRouter, useParams } from "next/navigation";

import { useState, useEffect, useContext, useRef } from "react";
import { ThreeDots } from "react-loader-spinner";

import { ImageUploader } from "../uploads/ImageUploader";

import { MentionsInput, Mention, SuggestionDataItem } from "react-mentions"

import { toast } from 'sonner';

import {
  postNewBitcoiner,
  postNewTransaction,
  getAddressUtxos,
  broadcastTx,
  getAllBitcoinerHandles,
  postNewNFTPost
} from "../../server-actions";
import { getLockupScript } from "../../utils/scrypt";
import { WalletContext } from "../../context/WalletContextProvider";
import { bsv } from "scrypt-ts";
import NFTBuyComponent from "../feeds/nfts-(not-used)/NFTBuyComponent";

interface deployProps {
  collection: any,
  order: any,
  closeDrawer: () => void;
  isDrawerVisible: boolean;
}

export default function DeployNFTPost({
  collection,
  order,
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
  } = useContext(WalletContext)!;
  
  const [darkMode, setDarkMode] = useState(false)

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const [note, setNote] = useState("");
  const [amountToLock, setAmountToLock] = useState<string>("0.00000001");
  const [blocksToLock, setBlocksToLock] = useState<number>(144);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [anonMode, setAnonMode] = useState(false);
  const anonBlocksToLock = 36

  const [mentionData, setMentionData] = useState<SuggestionDataItem[]>([])  

  const handleCheckboxChange = (e) => {
    // When the checkbox changes, update anonMode based on its checked status
    if (e.target.checked) {
      // Check if the note contains a base64 string
      const base64Regex = /^(data:.*?;base64,)/;
      if (base64Regex.test(note)) {
        setNote('');
      }
    }
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
    const fetchBitcoiners  = async () => {
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



  useEffect(() => {
    if (handle && pubkey) {
      const publicKey = bsv.PublicKey.fromHex(pubkey);
      let address = bsv.Address.fromPublicKey(publicKey);

      console.log("pubkey address: ", address.toString());
    }
  }, [pubkey]);



  const Lock = async () => {
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
        if (currentBlockHeight + blocksToLock <= currentBlockHeight) {
          alert("nLockTime should be greater than the current block height.");
          setBlocksToLock(1000);
          return; // Do not proceed with the locking process.
        }

        const nLockTime = currentBlockHeight + blocksToLock;

        console.log(parseFloat(amountToLock));

        if (parseFloat(amountToLock) * 100000000 > 2100000000) {
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

          const fullMessage = uploadedImage ? (note + " " + uploadedImage) : note

          console.log(fullMessage)

          const send = await relayone
            .send({
              to: lockupScript,
              amount: amountToLock,
              currency: "BSV",
              opReturn: [
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
                paymail,
                "order",
                order.txid
              ],
            })
            .catch((e) => {
              console.log(e.message);
              toast.error("An error occurred: " + e.message)
              setLoading(false);
            });

          if (send) {
            try {
              console.log(send);
              toast("Transaction posted on-chain: " + send.txid.slice(0, 6) + "..." + send.txid.slice(-6))
              const newPost = await postNewNFTPost(
                send.txid,
                parseFloat(amountToLock) * 100000000,
                send.paymail.substring(0, send.paymail.lastIndexOf("@")),
                fullMessage,
                nLockTime,
                order.txid
              );
              console.log(newPost);
              toast.success("Transaction posted to hodlocker.com: " + newPost.txid.slice(0, 6) + "..." + newPost.txid.slice(-6))

              setPaying(false);
              setLoading(false);
              router.refresh();
              closeDrawer();
            } catch (err) {
              console.log(err);
              toast.error("Error posting to hodlocker.com: " + err)
            }
          }
        }
      }
    } else {
      setLoading(false);
      await fetchRelayOneData();
      return;
    }
  };

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

      const privateKey = bsv.PrivateKey.fromString(
        "KzSSts7qwpGuJ8oPWdWNWN1dnpLvMuTPDZUyRkF2tmrtZMx1QLXe"
      );

      let publicKey = bsv.PublicKey.fromPrivateKey(privateKey);
      let address = bsv.Address.fromPublicKey(publicKey);

      console.log("address: " + address.toString());

      let tx = new bsv.Transaction();

      const utxo = await getAddressUtxos(address.toString());

      tx.from({
        // TXID that contains the output you want to unlock:
        txId: utxo[0].tx_hash,
        // Index of the UTXO:
        outputIndex: utxo[0].tx_pos,
        // Script of the UTXO. In this case it's a regular P2PKH script:
        script: "76a9140663f6cd4ed402c3555e08dfd1b4ef5856e1d99588ac",
        // Value locked in the UTXO in satoshis:
        satoshis: utxo[0].value,
      });

      if (nLockTime) {
        const lockupScript = await getLockupScript(
          nLockTime,
          publicKey.toString()
        );

        const opReturn = [
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
          "paymail",
          "anon",
          "order",
          order.txid
        ];

        tx.addOutput(
          new bsv.Transaction.Output({
            script: bsv.Script.fromASM(lockupScript),
            satoshis: 1,
          })
        );

        tx.addOutput(
          new bsv.Transaction.Output({
            script: bsv.Script.buildSafeDataOut(opReturn),
            satoshis: 0,
          })
        );

        tx.change("1anon2duh1CnEqfLuoXYuiTx2arHy1cSP");
        tx.feePerKb(1);

        console.log("Transaction before sealing and signing:", tx.toString());

        // Seal and sign the transaction
        tx = tx
          .seal()
          .sign("KzSSts7qwpGuJ8oPWdWNWN1dnpLvMuTPDZUyRkF2tmrtZMx1QLXe");

        console.log("Transaction after sealing and signing:", tx.toString());

        // Serialize the transaction for broadcasting
        const serializedTx = tx.serialize();

        console.log("Serialized transaction:", serializedTx);

        // Now, broadcast the transaction
        const broadcastedTx = await broadcastTx(serializedTx);

        console.log("broadcasted anon txid: ", broadcastedTx);
        toast("Transaction posted on-chain: " + broadcastedTx.slice(0, 6) + "..." + broadcastedTx.slice(-6))

        if (broadcastedTx) {
          const newPost = await postNewNFTPost(
            broadcastedTx,
            parseFloat(amountToLock) * 100000000,
            "anon",
            note,
            nLockTime,
            order.txid
          );
          console.log(newPost);
          toast.success("Transaction posted to hodlocker.com: " + newPost.txid.slice(0, 6) + "..." + newPost.txid.slice(-6) )
        }

        setPaying(false);
        setLoading(false);
        router.refresh();
        closeDrawer();
      } else {
        setLoading(false);
        return;
      }
    }
  };

  const spinner = () => {
    return (
      <>
        <div className="justify-center items-center flex">
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
      <div className="z-10 flex flex-col justify-between">
      <button
          id="dropdownNavbarLink"
          data-dropdown-toggle="dropdownNavbar"
          className="flex items-center justify-end w-full my-2 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-gray-400 dark:hover:text-white dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
        >
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
            NFT
          </span>
        </button>
                
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

        <div className="flex justify-between my-2">
          <div className="flex mb-0 pl-2 justify-start">
            <input
              id="default-checkbox"
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={anonMode}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="default-checkbox"
              className="flex ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              anon mode
            </label>
          </div>

          <div className="flex justify-end w-2/3 items-center mt-0 mb-0 pb-0">
            {isLinked ? 
              <ImageUploader
                onImageUpload={handleImageUpload}
                isDrawerVisible={isDrawerVisible}
              /> : null
            }
          </div>
        </div>

        <div className="pt-4 flex justify-center items-center">
            <NFTBuyComponent collection={collection} order={order} />
        </div>
        
        <div className="pt-8 flex justify-center items-center">
            <button
              onClick={() => {
                { anonMode ? AnonLock() : Lock(); }
              }}
              className="w-1/4 justify-center items-center transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-gradient-to-br hover:from-orange-300 hover:to-orange-600 duration-300 inline-block rounded-md border border-transparent bg-gradient-to-br from-orange-300 to-orange-600 shadow-lg shadow-orange-500/50 dark:shadow-lg dark:shadow-orange-800/80 mt-0 py-2 px-2 text-base font-medium text-white"
            >
              {paying || loading ? spinner() : "Post"}
            </button>
          </div>
             
      </div>
    </>
  );
}
