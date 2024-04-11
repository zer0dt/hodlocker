"use client";

// import * as bip39 from 'bip39';
import * as bip39 from "bip39";

import { hash160, bsv, ByteString } from "scrypt-ts";

import { Lockup } from "../../src/contracts/hodlocker";
import artifact from "../../artifacts/hodlocker.json";
import { ScriptData, getUtxoData, getUtxoData1, broadcastTx, postPermalocked } from "../server-actions";

import { toast } from 'sonner';

Lockup.loadArtifact(artifact);

const getLockupScript = async (nLockTime: number, pubKey: ByteString) => {
  const instance = new Lockup(hash160(pubKey), BigInt(nLockTime));

  return instance.lockingScript.toASM();
};

const callRedeem = async (
  handle: string,
  currentBlockHeight: number | undefined,
  transactions: { txid: string; spent: boolean; amount: number }[],
  mnemonic: string
) => {
  try {
    if (!currentBlockHeight) {
      alert("wait unti current block height is fetched");
      return;
    }

    console.log(transactions)

    // Filter out transactions that haven't been spent yet
    const unspentTransactions = transactions.filter(
      (transaction) => !transaction.spent
    );

    if (unspentTransactions.length == 0) {
      toast.error("There are no transactions to unlock.")
    }

    const extractTxids = (
      transactions: { txid: string; spent: boolean; amount: number }[]
    ) => {
      try {
        const txidArray = transactions.map((transaction) => transaction.txid);
        return txidArray;
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error:" + error)
        return []; // Return an empty array in case of an error.
      }
    };

    const txids = extractTxids(unspentTransactions);

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed, bsv.Networks.mainnet);

    const paymailPriv = hdPrivateKey.deriveChild("m/0'/236'/0'/0/0");
    const relayPriv = hdPrivateKey.deriveChild("m/44'/236'/0'/1/0");

    const paymailPrivateKey = paymailPriv.privateKey;
    const relayPrivateKey = relayPriv.privateKey;

    // paymail public key of the `paymail privateKey`
    const paymailPublicKey = paymailPrivateKey.publicKey;
    console.log(
      "hash160(pubkey): ",
      hash160(new bsv.PublicKey(paymailPublicKey).toString())
    );

    //relayX Address
    const relayAddress = relayPrivateKey.publicKey.toAddress(
      bsv.Networks.mainnet
    );
    const receiveAddress = relayAddress.toString();
    console.log("receiving address: ", receiveAddress);


    const utxos = await getUTXOsToUnlock(txids);

    const filteredUtxos = [];

    for (const utxo of utxos) {
      const lockedScript = bsv.Script.fromHex(utxo.script);
      const pubKeyHex = lockedScript.chunks[5].buf.toString("hex"); // Replace with the actual property name

      console.log(pubKeyHex)

      if (pubKeyHex === "b472a266d0bd89c13706a4132ccfb16f7c3b9fcb") {
        // If pubKeyHex matches, insert into the database with permalocked true
        postPermalocked(handle, utxo.txid)
      } else {
        // If pubKeyHex does not match, add the utxo to the filteredUtxos array
        filteredUtxos.push(utxo);
      }
    }

    // create new tx
    let bsvtx = new bsv.Transaction();
    let blockHeightToUse = 0;
    let satoshiSumToUnlock = 0;

    for (let i = 0; i < filteredUtxos.length; i++) {
      const utxo = filteredUtxos[i];

      console.log(utxo.script)

      const scriptBuffer = Buffer.from(utxo.script, 'hex');
      const lockedScript = bsv.Script.fromHex(scriptBuffer);

      bsvtx.addInput(
        new bsv.Transaction.Input({
          prevTxId: utxo.txid,
          outputIndex: utxo.vout,
          script: new bsv.Script(),
        }),
        lockedScript,
        utxo.satoshis
      );

      const lockedBlockHex = lockedScript.chunks[6].buf
        ? lockedScript.chunks[6].buf.toString("hex")
        : 0;
      const lockedBlock = hex2Int(lockedBlockHex);
      if (blockHeightToUse < lockedBlock) {
        blockHeightToUse = lockedBlock;
      }
      satoshiSumToUnlock += utxo.satoshis;
    }

    bsvtx.lockUntilBlockHeight(blockHeightToUse);

    const txSize = bsvtx.inputs.length * 1000 // estimate 1000 bytes for input (it's around 900 something)
    const feeRate = 3 / 1000 // 3 sat/KB
    const fee = Math.ceil(txSize * feeRate)
    if (satoshiSumToUnlock < fee) {
      console.error("Amount to unlock is too low");
      toast.error("Amount to unlock is too low")
      return
    }

    bsvtx.to(receiveAddress, satoshiSumToUnlock - fee); // subtract 1 satoshi to pay the transaction fee

    for (let i = 0; i < filteredUtxos.length; i++) {
      const utxo = filteredUtxos[i];

      const solution = unlockLockScript(
        bsvtx,
        i,
        utxo.script,
        utxo.satoshis,
        paymailPrivateKey
      );
      bsvtx.inputs[i].setScript(solution);
    }

    console.log(bsvtx.toString())
    const broadcastedTx = await broadcastTx(bsvtx.toString());

    toast.success("Successful full unlock: " + broadcastedTx.slice(0, 6) + "..." + broadcastedTx.slice(-6))
    return broadcastedTx
  } catch (error) {
    console.error("An error occurred:", error);
    toast.error("An error occurred: " + error)

    alert(error);
  }
};

const callRedeemL2M = async (
  currentBlockHeight: number | undefined,
  txid: string,
  mnemonic: string
) => {
  try {
    if (!currentBlockHeight) {
      alert("wait unti current block height is fetched");
      return;
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdPrivateKey = bsv.HDPrivateKey.fromSeed(seed, bsv.Networks.mainnet);

    const paymailPriv = hdPrivateKey.deriveChild("m/0'/236'/0'/0/0");
    const relayPriv = hdPrivateKey.deriveChild("m/44'/236'/0'/1/0");

    const paymailPrivateKey = paymailPriv.privateKey;
    const relayPrivateKey = relayPriv.privateKey;

    // paymail public key of the `paymail privateKey`
    const paymailPublicKey = paymailPrivateKey.publicKey;
    console.log(
      "hash160(pubkey): ",
      hash160(new bsv.PublicKey(paymailPublicKey).toString())
    );

    //relayX Address
    const relayAddress = relayPrivateKey.publicKey.toAddress(
      bsv.Networks.mainnet
    );
    const receiveAddress = relayAddress.toString();
    console.log("receiving address: ", receiveAddress);

    toast('Getting utxo for txid: ' + txid.slice(0, 6) + "..." + txid.slice(-6));

    const utxoRes = await getUtxoData1(txid);
    const utxo = getUTXO1(utxoRes, txid);

    // create new tx
    let bsvtx = new bsv.Transaction();
    let blockHeightToUse = 0;
    let satoshiSumToUnlock = 0;

    console.log(utxo.script)

    const scriptBuffer = Buffer.from(utxo.script, 'hex');
    const lockedScript = bsv.Script.fromHex(scriptBuffer);

    bsvtx.addInput(
      new bsv.Transaction.Input({
        prevTxId: utxo.txid,
        outputIndex: utxo.vout,
        script: new bsv.Script(),
      }),
      lockedScript,
      utxo.satoshis
    );

    const lockedBlockHex = lockedScript.chunks[6].buf
      ? lockedScript.chunks[6].buf.toString("hex")
      : 0;
    const lockedBlock = hex2Int(lockedBlockHex);
    if (blockHeightToUse < lockedBlock) {
      blockHeightToUse = lockedBlock;
    }
    satoshiSumToUnlock += utxo.satoshis;


    bsvtx.lockUntilBlockHeight(blockHeightToUse);

    const txSize = bsvtx.inputs.length * 1000 // estimate 1000 bytes for input (it's around 900 something)
    const feeRate = 3 / 1000 // 3 sat/KB
    const fee = Math.ceil(txSize * feeRate)
    if (satoshiSumToUnlock < fee) {
      console.error("Amount to unlock is too low");
      toast.error("Amount to unlock is too low")
      return
    }

    bsvtx.to(receiveAddress, satoshiSumToUnlock - fee); // subtract 1 satoshi to pay the transaction fee

    const solution = unlockLockScript(
      bsvtx,
      0,
      utxo.script,
      utxo.satoshis,
      paymailPrivateKey
    );

    bsvtx.inputs[0].setScript(solution);


    console.log(bsvtx.toString())
    const broadcastedTx = await broadcastTx(bsvtx.toString());

    toast.success("Successful full unlock: " + broadcastedTx.slice(0, 6) + "..." + broadcastedTx.slice(-6))
    return broadcastedTx
  } catch (error) {
    console.error("An error occurred:", error);
    toast.error("An error occurred: " + error)

    alert(error);
  }
};

const getUTXOsToUnlock = async (txids: string[]) => {
  try {
    const utxos = [];

    for (const txid of txids) {
      console.log("Getting utxo for txid: ", txid);
      toast('Getting utxo for txid: ' + txid.slice(0, 6) + "..." + txid.slice(-6));

      const utxoRes = await getUtxoData(txid);
      const utxo = getUTXO(utxoRes, txid);
      utxos.push(utxo);
    }

    return utxos;
  } catch (error) {
    console.error("Error in getUTXOsToUnlock:", error);
    throw error; // Re-throw the error to propagate it to the caller
  }
};

const getUTXO = (utxoRes: ScriptData, txid: string) => {

  console.log(utxoRes)
  return {
    satoshis: utxoRes.satoshis,
    vout: 0,
    txid: txid,
    script: utxoRes.script,
  };
};

const getUTXO1 = (utxoRes: ScriptData, txid: string) => {

  console.log(utxoRes)
  return {
    satoshis: utxoRes.satoshis,
    vout: 1,
    txid: txid,
    script: utxoRes.script,
  };
};

// build the solution to the locking script by constructing the pre image and signature
const unlockLockScript = (
  tx: bsv.Transaction,
  inputIndex: number,
  lockTokenScript: string,
  satoshis: number,
  privkey: bsv.PrivateKey
) => {
  const sighashType =
    bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;
  const scriptCode = bsv.Script.fromHex(lockTokenScript);
  const value = new bsv.crypto.BN(satoshis);
  // create preImage of current transaction with valid nLockTime
  const preimg = bsv.Transaction.Sighash.sighashPreimage(
    tx,
    sighashType,
    inputIndex,
    scriptCode,
    value
  ).toString("hex");
  let s;
  if (privkey) {
    // sign transaction with private key tied to public key locked in script
    s = bsv.Transaction.Sighash.sign(
      tx,
      privkey,
      sighashType,
      inputIndex,
      scriptCode,
      value
    ).toTxFormat();
  }
  return bsv.Script.fromASM(
    `${s.toString("hex")} ${privkey.toPublicKey().toHex()} ${preimg}`
  ).toHex();
};

const hex2Int = (hex: string) => {
  const reversedHex = changeEndianness(hex);
  return parseInt(reversedHex, 16);
};

const changeEndianness = (hex: string) => {
  // change endianess of hex value before placing into ASM script
  const result = [];
  let len = hex.length - 2;
  while (len >= 0) {
    result.push(hex.substr(len, 2));
    len -= 2;
  }
  return result.join("");
};

export { getLockupScript, callRedeem, callRedeemL2M };
