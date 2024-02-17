'use server'

import { ByteString, bsv, hash160 } from 'scrypt-ts'
import { Lockup } from "@/src/contracts/hodlocker";
import artifact from "@/artifacts/hodlocker.json";

import { HODLTransactions, broadcastTx, getAddressUtxos, postNewTransaction } from '../../server-actions'

Lockup.loadArtifact(artifact);

const getLockupScript = async (nLockTime: number, pubKey: ByteString) => {
    const instance = new Lockup(hash160(pubKey), BigInt(nLockTime));
  
    return instance.lockingScript.toASM();
  };

  
const privKey = process.env.POST_TWITTER_PRIVATE_KEY as string

export const postWithTwitter = async (handle: string, note: string, sub: string, amountToLock: string, nLockTime: number): Promise<HODLTransactions | undefined> => {
    if (!privKey) {
        console.error("No private key to fund twitter posting found.");
        return;
    }

    try {
        const privateKey = bsv.PrivateKey.fromString(privKey);
        let publicKey = bsv.PublicKey.fromPrivateKey(privateKey);
        let address = bsv.Address.fromPublicKey(publicKey);

        // Create a change address from the private key
        let changeAddress = bsv.Address.fromPublicKey(publicKey).toString();

        let tx = new bsv.Transaction();

        const utxo = await getAddressUtxos(address.toString());
        if (utxo.length === 0) {
            throw new Error("No UTXOs found for the address.");
        }

        tx.from({
            txId: utxo[0].tx_hash,
            outputIndex: utxo[0].tx_pos,
            script: "76a9140663f6cd4ed402c3555e08dfd1b4ef5856e1d99588ac",
            satoshis: utxo[0].value,
        });

        if (nLockTime) {
            const lockupScript = await getLockupScript(nLockTime, publicKey.toString());

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
                handle + "@hodlocker.com",
            ];

            tx.addOutput(new bsv.Transaction.Output({
                script: bsv.Script.fromASM(lockupScript),
                satoshis: 1,
            }));

            tx.addOutput(new bsv.Transaction.Output({
                script: bsv.Script.buildSafeDataOut(opReturn),
                satoshis: 0,
            }));

            tx.change(changeAddress);
            tx.feePerKb(2);

            tx = tx.seal().sign(privKey);

            const serializedTx = tx.serialize();

            const broadcastedTx = await broadcastTx(serializedTx);

            const hasImage = false

            if (broadcastedTx) {
                const newPost = await postNewTransaction(
                    broadcastedTx,
                    parseFloat(amountToLock) * 100000000,
                    handle,
                    note,
                    nLockTime,
                    sub,
                    hasImage
                );
                return newPost;
            }
        }
    } catch (error) {
        console.error("Error in postAnon function:", error);
        // Handle the error appropriately
    }
};



