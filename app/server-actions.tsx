'use server'

import prisma from './db'
import { Bitcoiner, Transactions, LockLikes, Replies } from '@prisma/client'

import sha256 from "crypto-js/sha256";
import hexEnc from "crypto-js/enc-hex";

const apiKey = process.env.TAAL_MAINNET_API_KEY as string; // Replace with your API key


export interface HODLTransactions extends Transactions {
  txid: string;
  amount: number;
  handle_id: string;
  note: string;
  locked_until: number;
  created_at: Date;
  totalAmountandLockLiked: number; // Add this property
  totalAmountandLockLikedForReplies: number
  locklikes: LockLikes[],
  replies?: Replies[]
}

export interface HODLBitcoiners extends Bitcoiner {
  totalAmountandLockLiked: number;
  totalLockLikedFromOthers: number;
}


export async function getAllBitcoinerHandles(): Promise<string[]> {

  try {
      // Query the database for all bitcoiners to get their handles
      const allBitcoiners = await prisma.bitcoiner.findMany({
          select: {
              handle: true // Only select the handle field
          }
      });

      // Extract the handles from the fetched data
      const handles = allBitcoiners.map(bitcoiner => bitcoiner.handle);

      return handles;

  } catch (error) {
      console.error('Error fetching bitcoiner handles:', error);
      throw error;
  }
}

export async function fetchBitcoinerWalletHistory(handle: string): Promise<HODLBitcoiners> {
  const bitcoiner = await prisma.bitcoiner.findUnique({
    where: {
      handle,
    },
    select: {
      handle: true,
      created_at: true, // Add this line to select the created_at property for the Bitcoiner
      transactions: {
        select: {
          txid: true,
          amount: true,
          locked_until: true,
          created_at: true, // Add this line to select the created_at property for transactions
          // Add other transaction properties as needed
        },
      },
      locklikes: {
        select: {
          txid: true,
          amount: true,
          locked_until: true,
          created_at: true, // Add this line to select the created_at property for locklikes
          post_id: true,
          post: {
            select: {
              link: {
                select: {
                  handle: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!bitcoiner) {
    throw new Error(`Bitcoiner with handle ${handle} not found.`);
  }

  const totalLockedFromTransactions = bitcoiner.transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  const totalLockedFromLockLikes = bitcoiner.locklikes.reduce(
    (total, locklike) => total + locklike.amount,
    0
  );

  const bitcoin_locked = (totalLockedFromTransactions + totalLockedFromLockLikes) / 100000000;

  return {
    ...bitcoiner,
    totalAmountandLockLiked: bitcoin_locked
  };
}


export async function fetchTransaction(txid: string) {
  const currentBlockHeight = await fetchCurrentBlockHeight();
  try {
    const transaction = await prisma.transactions.findUnique({
      where: {
        txid: txid,
      },
      include: {
        tags: true,
        locklikes: {
          where: {
            locked_until: {
              gt: currentBlockHeight
            }
          }
        },
        link: true, // Include the associated Bitcoiner
        replies: {
          include: {
            locklikes: {
              where: {
                locked_until: {
                  gt: currentBlockHeight
                }
              }
            },
            transaction: {
              include: {
                tags: true,
                link: true // Include the associated Bitcoiner for the original transaction
              }
            }
          }
        },
      },
    });
    

    if (!transaction) {
      return null;
    }

    // Calculate the total amount including locklikes for the transaction
    const totalAmountandLockLiked = transaction.locklikes.reduce(
      (total, locklike) => total + locklike.amount,
      transaction.amount
    );

    // Calculate the total amount including locklikes for each reply
    const repliesWithTotalAmount = transaction.replies.map((reply) => ({
      ...reply,
      totalAmountandLockLiked: reply.locklikes.reduce(
        (total, locklike) => total + locklike.amount,
        reply.amount
      ),
    }));

    // Calculate the total amount including locklikes for replies of the transaction
    const totalAmountandLockLikedForReplies = repliesWithTotalAmount.reduce(
      (total, reply) => total + reply.totalAmountandLockLiked,
      0
    );

    // Add the calculated total amount to the transaction
    const transactionWithTotalAmount = {
      ...transaction,
      totalAmountandLockLiked,
      totalAmountandLockLikedForReplies: totalAmountandLockLikedForReplies,
      replies: repliesWithTotalAmount,
    };

    return transactionWithTotalAmount;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}


export async function fetchLatestTransactionsByBitcoiner(handle: string, offset: number, limit: number): Promise<HODLTransactions[]> {
  const currentBlockHeight = await fetchCurrentBlockHeight();

  try {
    const transactions = await prisma.transactions.findMany({
      where: {
        AND: [
          {
            locked_until: {
              gte: currentBlockHeight,
            },
          },
          {
            handle_id: handle, // Add a filter by bitcoiner handle
          },
        ]
      },
      skip: offset, 
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        locklikes: {
          where: {
            locked_until: {
              gte: currentBlockHeight,
            },
          },
          select: {
            amount: true,
            locked_until: true,
          },
        },
      },
    });

    const enrichedTransactions = transactions.map((transaction) => {
      const totalLockLiked = transaction.locklikes.reduce(
        (sum, locklike) => sum + locklike.amount,
        0
      );
      const totalAmountandLockLiked = totalLockLiked + transaction.amount;

      // Calculate vibes for this transaction
      const lockupPeriod = transaction.locked_until - currentBlockHeight;
      const initialVibes = (transaction.amount / 100000000) * Math.log(lockupPeriod);

      // Calculate the total vibes of all locklikes
      const totalLockLikeVibes = transaction.locklikes.reduce((sum, locklike) => {
        const locklikeLockupPeriod = locklike.locked_until - currentBlockHeight;
        const locklikeVibes = (locklike.amount / 100000000) * Math.log(locklikeLockupPeriod);
        return sum + locklikeVibes;
      }, 0);

      const totalVibes = initialVibes + totalLockLikeVibes;

      return {
        ...transaction,
        totalLockLiked,
        totalAmountandLockLiked,
        initialVibes,
        totalLockLikeVibes,
        totalVibes,
      };
    });

    return enrichedTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}
 
export async function postLockLike(
  txid: string,
  amount: number,
  nLockTime: number,
  handle: string, 
  postTxid?: string,
  replyTxid?: string  
  ): Promise<LockLikes> {
    'use server'

    const Pusher = require("pusher")
     
    const newLockLike = await prisma.lockLikes.create({
        data: {
            txid: txid,
            amount: amount,    
            locked_until: nLockTime,            
            handle_id: handle,          
            post_id: postTxid,
            reply_txid: replyTxid
        },
    });

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: 'true'
    })


    pusher.trigger('hodlocker', 'new-locklike', {
      message: newLockLike,
      type: "locklike"
    })

    return newLockLike;  
};


export async function postNewBitcoiner(handle: string, pubkey: string) {
  const newBitcoiner = await prisma.bitcoiner.upsert({
    where: {
      handle: handle
    },
    update: {}, // no update in this case, since we're just ensuring it exists
    create: {
      handle: handle,
      pubkey: pubkey
    }
  })
}

export async function createNewTag(name: string, ticker: string) {
  const newTag = await prisma.tag.upsert({
    where: {
      name: ticker, // Unique identifier for the tag
    },
    update: {}, // No update, since we're just ensuring the tag exists
    create: {
      name: ticker,
      fullName: name,
      type: "topic" // Assuming "coin" is the default type for new tags
    }
  });

  return newTag;
}


export async function postNewTransaction(txid: string, amount: number, handle: string, note: string, nLockTime: number, sub: string) {

  // Calculate the size of the note string in bytes
  const noteSizeInBytes = Buffer.from(note).length; 

  console.log("noteSize", noteSizeInBytes)

  // Check if the message size exceeds Pusher's limit (10KB)
  const maxPusherMessageSize = 10 * 1024; // 10KB in bytes

  if (noteSizeInBytes > maxPusherMessageSize) {
    // Handle the case where the message size exceeds Pusher's limit, e.g., log a warning
    console.warn('Warning: Message size exceeds Pusher limit. Message will not be sent to Pusher.');
  }

   // Find or create the tag
   let tag = await prisma.tag.findUnique({
    where: {
      name: sub,
    },
  });

  // Create the transaction in Prisma
  const newTransaction = await prisma.transactions.create({
    data: {
      txid: txid,
      amount: amount,
      handle_id: handle,
      note: note,
      locked_until: nLockTime,
      tags: {
        connect: {
          id: tag?.id,
        },
      },
    },
  });

  // Trigger Pusher if the message size is within the limit
  if (noteSizeInBytes <= maxPusherMessageSize) {
    const Pusher = require('pusher');
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: 'true'
    });

    newTransaction.created_at = new Date();

    pusher.trigger('hodlocker', 'new-post', {
      message: newTransaction,
      type: "post"
    });
  }

  return newTransaction;
}

export async function postNewNFTPost(txid: string, amount: number, handle: string, note: string, nLockTime: number, nft_txid: string ) {

  // Calculate the size of the note string in bytes
  const noteSizeInBytes = Buffer.from(note).length; 

  console.log("noteSize", noteSizeInBytes)

  // Check if the message size exceeds Pusher's limit (10KB)
  const maxPusherMessageSize = 10 * 1024; // 10KB in bytes

  if (noteSizeInBytes > maxPusherMessageSize) {
    // Handle the case where the message size exceeds Pusher's limit, e.g., log a warning
    console.warn('Warning: Message size exceeds Pusher limit. Message will not be sent to Pusher.');
  }

  // Create the transaction in Prisma
  const newTransaction = await prisma.nFTPosts.create({
    data: {
      txid: txid,
      amount: amount,
      handle_id: handle,
      note: note,
      locked_until: nLockTime,
      nft_txid: nft_txid
    },
  });

  // Trigger Pusher if the message size is within the limit
  if (noteSizeInBytes <= maxPusherMessageSize) {
    const Pusher = require('pusher');
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: 'true'
    });

    newTransaction.created_at = new Date();

    pusher.trigger('hodlocker', 'new-post', {
      message: newTransaction,
      type: "post"
    });
  }

  return newTransaction;
}


export async function postNewReply(txid: string, amount: number, postTxid: string, handle: string, note: string, nLockTime: number) {
  
  // Calculate the size of the note string in bytes
  const noteSizeInBytes = Buffer.from(note).length;

  // Check if the message size exceeds Pusher's limit (10KB)
  const maxPusherMessageSize = 10 * 1024; // 10KB in bytes

  if (noteSizeInBytes > maxPusherMessageSize) {
    // Handle the case where the message size exceeds Pusher's limit, e.g., log a warning
    console.warn('Warning: Message size exceeds Pusher limit. Message will not be sent to Pusher.');
  }
  
  const newReply = await prisma.replies.create({
      data: {
      txid: txid,
      handle_id: handle,      
      post_id: postTxid,
      note: note,
      amount: amount,
      locked_until: nLockTime
      },
  })  

  // Trigger Pusher if the message size is within the limit
  if (noteSizeInBytes <= maxPusherMessageSize) {

    const Pusher = require('pusher')
  
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: 'true'
    })

    pusher.trigger('hodlocker', 'new-reply', {
      message: newReply,
      type: "reply"
    })
  }   

  return newReply  
}

export async function getScriptHash(txid: string) {
  const url = "https://api.whatsonchain.com/v1/bsv/main/tx/hash/" + txid;
  
  const maxRequestsPerSecond = 3;
  const delayMs = 1000 / maxRequestsPerSecond; // Calculate delay in milliseconds

  try {
    const data = await fetchWithRateLimit(url, delayMs,);
    const scriptPubKeyHex = data.vout[0].scriptPubKey.hex;
    const scriptHash = hexEnc.stringify(sha256(hexEnc.parse(scriptPubKeyHex)));

    return scriptHash.match(/.{2}/g).reverse().join("");
  } catch (error) {
    throw error;
  }
}



export async function getScriptUTXOs(scripthash: string) {
  const url = "https://api.whatsonchain.com/v1/bsv/main/script/" + scripthash + "/unspent";

  const maxRequestsPerSecond = 3;
  const delayMs = 1000 / maxRequestsPerSecond; // Calculate delay in milliseconds

  
  try {
    const data = await fetchWithRateLimit(url, delayMs); // Using fetchWithRateLimit here
    return data; // Return the UTXOs array
  } catch (error) {
    throw error;
  }
}

export async function checkIfSpent(handle: string, txidToCheck: string, retries = 20) {
  let scripthash;
  let scriptUtxos;

  while (retries > 0) {
    try {
      scripthash = await getScriptHash(txidToCheck);
      scriptUtxos = await getScriptUTXOs(scripthash);
      break;  // Break out of the loop if no errors
    } catch (error) {
      if (retries === 1) throw error; // If it's the last retry, throw the error
      retries--;  // Decrement retries and continue looping
    }
  }

  // Check if txidToCheck exists in the UTXOs array
  const txidExists = await scriptUtxos.some((utxo: { tx_hash: string; }) => utxo.tx_hash === txidToCheck);

  if (txidExists) {      
      return false;
  } else {    
    // Transaction is spent, add it to the database
    await prisma.spentTx.create({
      data: {
        txid: txidToCheck,
        handle_id: handle,
        permalocked: false
      },
    });
    return true;  
  }
}



export async function getAddressUtxos(address: string) {
  const res = await fetch('https://api.whatsonchain.com/v1/bsv/main/address/' + address + '/unspent', { next: { revalidate: 0 } })

  if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
  }
   
  const data = await res.json();
  return data; // Return the UTXOs array
}

export async function broadcastTx(txhex: string) {
  const url = 'https://api.whatsonchain.com/v1/bsv/main/tx/raw';

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txhex }),
    
  };

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorMessage = `Failed to broadcast transaction: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function postPermalocked(handle: string, txid: string) {
  const permalocked = await prisma.spentTx.create({
    data: {
      txid: txid, // Assuming utxo object has a txid property
      handle_id: handle, // Replace 'handle' with the appropriate variable or value
      permalocked: true
    },
  });
}

export async function getRawTx(txid: string, retries = 20) {
  const url = "https://api.whatsonchain.com/v1/bsv/main/tx/" + txid + "/hex";

  while (retries > 0) {
    try {
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          'Authorization': apiKey
        },
        next: { revalidate: 0 }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const rawTx = await res.text();
      return rawTx;

    } catch (error) {
      if (retries === 1) throw error; // If it's the last retry, throw the error
      retries--; // Decrement retries and continue looping
    }
  }
};


export async function fetchCurrentBlockHeight() {
  const url = 'https://api.bitails.io/block/latest';

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      },
      mode: "cors",
    });

    if (!res.ok) {
      console.log("fetching current blockheight failed with status code " + res.status)
    }

    const data = await res.json();

    return data.height;
  } catch (error) {
    throw error;
  }
}

export async function getOpReturnData(txid: string) {
  const url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/opreturn`;

  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      const errorResponse = await res.text(); // Get the error response details
      const truncatedResponse = errorResponse.substring(0, 200); // Truncate to the first 200 characters
      console.error(`API Error Response: ${truncatedResponse}... (truncated)`);
      throw new Error('Failed to fetch opreturn data');
    }

    function hexToAscii(hex: string) {
      const hexString = hex.replace(/\s/g, ''); // Remove any spaces in the hex string
      let asciiString = '';
    
      for (let i = 0; i < hexString.length; i += 2) {
        const hexCharCode = parseInt(hexString.substr(i, 2), 16);
        asciiString += String.fromCharCode(hexCharCode);
      }
    
      return asciiString;
    }

    const opReturnData = await res.json(); // Read the opreturn data from the response

    const data = hexToAscii(opReturnData[0].hex)

    // Extract data URI for JPG, PNG, or GIF if it exists
    const imageDataRegex = /data:image\/(jpg|png|gif);base64,[A-Za-z0-9+/=]+/;
    const match = data.match(imageDataRegex);

    if (match) {
      const imageDataString = match[0];
      const truncatedImageString = imageDataString.substring(0, 200); // Truncate to 200 characters
      const image = imageDataString
      console.log(`Extracted Image Data: ${truncatedImageString}... (truncated)`);

      return image
    } else {
      return null
    }

  } catch (error) {
    throw error;
  }
}

const fetchWithRateLimit = async (url: string, delayMs: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          mode: "cors",
          headers: {
            'Authorization': apiKey
          },
          next: { revalidate: 0 }
        });

        if (!res.ok) {
          console.log(res.status);
          throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }, delayMs);
  });
};




