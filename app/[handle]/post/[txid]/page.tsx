
import React from 'react';

import PostComponent from '@/app/components/posts/PostComponent';

import { fetchTransaction, postLockLike } from '@/app/server-actions';
import prisma from '@/app/db';

import { Metadata, ResolvingMetadata } from "next";
import { notFound } from 'next/navigation';
import ReplyComponent from '@/app/components/posts/replies/ReplyComponent';
import ReplyInteraction from '@/app/components/actions/ReplyInteraction';

import { cache } from 'react'

type Props = {
    params: {
        handle: string,
        txid: string
    };
};

export const getTransaction = cache(async (txid: string) => {
    const transaction = await fetchTransaction(txid);
    return transaction
})

function extractDataImageString(inputString: string) {
    // Find the index where 'data:image' starts
    const startIndex = inputString.indexOf('data:image');

    if (startIndex !== -1) {
        // Extract the substring starting from startIndex
        const extractedString = inputString.substring(startIndex);
        return extractedString;
    } else {
        return null; // Indicates that 'data:image' is not found in the string
    }
}


export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    let transaction = await getTransaction(params.txid);

    // If the transaction is null, render a 404 Not Found page
    if (!transaction) {
        const postTxidForReply = await fetchPostTxidforReply(params.txid);

        if (postTxidForReply) {
            transaction = await getTransaction(postTxidForReply);
        }

        if (!transaction) {
            console.log("No transaction found");
        }
    }

    // Initialize variables for the title, description, and image
    let title = "";
    let description = "";
    let image = "/townsquare.png"

    // Check if transaction is null
    if (transaction) {
        title = `${(transaction.totalAmountandLockLiked / 100000000).toFixed(2)} bitcoin locked on ${params.handle}'s post`;

        // Handle the case when there is no "data:image" in the note
        description = transaction.note.length > 200
            ? transaction.note.slice(0, 200) + "..."
            : transaction.note;
        
    } else {
        // Handle the case when transaction is null
        description = "Transaction not found";
    }

    if (transaction && transaction.hasImage) {
        try {
            const response = await fetch(`https://api.bitails.io/download/tx/${transaction.txid}/output/2`, {
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                cache: 'force-cache'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch image data');
            }
            const responseData = await response.text()

            const base64Image = extractDataImageString(responseData);

            if (base64Image) {
                image = base64Image;
            }
            

        } catch (error) {
            console.error('Error fetching image data:', error);
        }
    }

    const metadata: Metadata = {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [{ url: image }]
        },
        twitter: {
            card: 'summary',
            title: title, // Include the title here
            description: description, // Include the description here
            images: [{ url: image }] // Include the image URL here
        }
    };

    return metadata;
}


async function fetchPostTxidforReply(txid: string) {
    const reply = await prisma.replies.findUnique({
        where: {
            txid: txid
        },
        select: {
            post_id: true
        }
    });

    return reply ? reply.post_id : null;
}


export default async function TransactionDetail({ params }: { params: { txid: string } }) {
    let transaction = await getTransaction(params.txid)

    // If the transaction is null, render a 404 Not Found page
    if (!transaction) {
        const postTxidForReply = await fetchPostTxidforReply(params.txid);

        if (postTxidForReply) {
            transaction = await getTransaction(postTxidForReply);
        }

        if (!transaction) {
            return notFound()
        }
    }

    // Otherwise, render the Post component with the non-null transaction
    return (
        <main className="flex flex-col items-center justify-center pt-4 lg:p-12 lg:pt-6">
            <div className="grid grid-cols-1 gap-0 w-full lg:w-96 p-0">
                <PostComponent transaction={transaction} postLockLike={postLockLike} postTxid={params.txid} />
                <div className="rounded-lg w-full bg-white dark:bg-black px-2 pb-4">
                    <ReplyInteraction transaction={transaction} />
                </div>
                <div className="pt-4 pb-24">
                    {transaction.replies.map((reply, index) => (
                        <ReplyComponent key={index} reply={reply} postLockLike={postLockLike} />
                    ))}
                </div>
            </div>
        </main>
    )
}
