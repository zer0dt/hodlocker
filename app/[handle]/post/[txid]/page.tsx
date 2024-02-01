
import React from 'react';

import PostComponent from '@/app/components/posts/PostComponent';

import { fetchTransaction, postLockLike } from '@/app/server-actions';
import prisma from '@/app/db';

import { Metadata, ResolvingMetadata } from "next";
import { notFound } from 'next/navigation';
import ReplyComponent from '@/app/components/posts/replies/ReplyComponent';
import DeployInteraction from '@/app/components/actions/deployPost';
import ReplyInteraction from '@/app/components/actions/ReplyInteraction';

type Props = {
    params: {
        handle: string,
        txid: string
    };
};


export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    let transaction = await fetchTransaction(params.txid);

    // If the transaction is null, render a 404 Not Found page
    if (!transaction) {
        const postTxidForReply = await fetchPostTxidforReply(params.txid);

        if (postTxidForReply) {
            transaction = await fetchTransaction(postTxidForReply);
        }

        if (!transaction) {
            console.log("No transaction found");
        }
    }

    // Initialize variables for the title, description, and image
    let title = "";
    let description = "";
    let image = "/locked.jpg"

    // Check if transaction is null
    if (transaction && transaction.note) {
        // Split the note by "data:image"
        const note = transaction.note;
        const parts = note.split("data:image");

        title = `${(transaction.totalAmountandLockLiked / 100000000).toFixed(2)} bitcoin locked on ${params.handle}'s post`;

        if (parts.length > 1) {
            // The description is the text before "data:image" in the first part
            description = parts[0].trim();
            image = `/api/images/${params.txid}`;
        } else {
            // Handle the case when there is no "data:image" in the note
            description = transaction.note.length > 200
                ? transaction.note.slice(0, 200) + "..."
                : transaction.note;
        }
    } else {
        // Handle the case when transaction is null
        description = "Transaction not found";
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
    let transaction = await fetchTransaction(params.txid)

    // If the transaction is null, render a 404 Not Found page
    if (!transaction) {
        const postTxidForReply = await fetchPostTxidforReply(params.txid);

        if (postTxidForReply) {
            transaction = await fetchTransaction(postTxidForReply);
        }

        if (!transaction) {
            return notFound()
        }
    }

    // Otherwise, render the Post component with the non-null transaction
    return (
        <main className="flex flex-col items-center justify-center pt-4 lg:p-12 lg:pt-6">
            <div className="grid grid-cols-1 gap-0 w-full lg:w-96 p-0">
                <PostComponent transaction={transaction} postLockLike={postLockLike} />
                <ReplyInteraction transaction={transaction} />
                <div className="pt-8 pb-24">
                    {transaction.replies.map((reply, index) => (
                        <ReplyComponent key={index} reply={reply} postLockLike={postLockLike} />
                    ))}
                </div>
            </div>
        </main>
    )
}
