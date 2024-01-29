
'use client'

import React, { useEffect, useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import DOMPurify from "isomorphic-dompurify";
import { Tweet } from '../tweets/tweet'

import { MdExpandMore } from "react-icons/md";
import { MdExpandLess } from "react-icons/md";

import { HODLTransactions } from "../../server-actions";

import PostPlaceHolder from './placeholders/PostPlaceholder'

interface PostContentProps {
    transaction: HODLTransactions
}

function extractDataUrl(note: string) {
    const dataUrlRegex = /data:image[^'"]*/;
    const matchDataUrl = note.match(dataUrlRegex);

    // Check if the note contains a Tenor URL pattern
    const tenorUrlRegex = /https:\/\/media\.tenor\.com\/.*/;
    const matchTenorUrl = note.match(tenorUrlRegex);

    if (matchDataUrl) {
        return matchDataUrl[0]; // Return the data URL if found
    } else if (matchTenorUrl) {
        return matchTenorUrl[0]; // Return the Tenor URL if found
    } else {
        return null; // Return null if neither pattern is found
    }
}

function formatNote(note: string) {
    // Convert URLs to anchor tags and embed YouTube iframes
    let formattedNote = note.replace(/https?:\/\/[^\s]+|www\.[^\s]+/g, (url) => {
        // Check if the URL is a YouTube video link
        const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            return `<iframe width="300" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }

        // Otherwise, create an anchor tag for the URL
        const href = url.startsWith('www.') ? 'https://' + url : url;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer"><span class="text-orange-400">${url}</span></a>`;
    });

    // Convert newlines to <br/>
    formattedNote = formattedNote.replace(/\n/g, "<br/>");

    // Convert mentions of type [@handle] and @handle
    const mentionRegex = /@([a-zA-Z0-9_-]+)|\[@([a-zA-Z0-9_-]+)\]/g;
    formattedNote = formattedNote.replace(mentionRegex, (match, p1, p2) => {
        const handle = p1 || p2;
        return `<a href="/${handle}"><span class="text-orange-400">@${handle}</span></a>`;
    });

    return DOMPurify.sanitize(formattedNote, { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'frameborder', 'allowfullscreen', 'href', 'target'] });
}

function containsTwitterLink(note: string | null | undefined) {
    // Check if note is null or undefined before applying regular expression
    if (note) {
        // Use a regular expression to check for Twitter or X links
        const twitterOrXRegex = /https?:\/\/(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]+\/status\/[0-9]+(\?[^ ]*)?/i;
        return twitterOrXRegex.test(note);
    }
    return false; // Handle the case when note is null or undefined
}

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


function PostContent({ transaction }: PostContentProps) {

    const [postImage, setPostImage] = useState<string | null>();
    const [note, setNote] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        setIsLoading(true);

        const fetchData = async () => {

            if (transaction.hasImage) {
                try {
                    const response = await fetch(`https://api.bitails.io/download/tx/${transaction.txid}/output/2`, {
                        headers: {
                            'Content-Type': 'application/octet-stream'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch image data');
                    }
                    const responseData = await response.text()

                    const base64Image = extractDataImageString(responseData);

                    setPostImage(base64Image);
                } catch (error) {
                    console.error('Error fetching image data:', error);
                }
            }

            const htmlStructure = extractDataUrl(transaction.note);
            if (htmlStructure) {
                setPostImage(htmlStructure)
            }

            const noteWithoutHTMLStructure = transaction.note.replace(htmlStructure, "");
            setNote(noteWithoutHTMLStructure);
            setIsLoading(false);
        };

        fetchData();

    }, [transaction.txid]);



    return (
        isLoading ? (
            <PostPlaceHolder />
        ) : (
            <>
                <Link href={`/${transaction.handle_id}/post/${transaction.txid}`}>
                    {postImage && <Image src={postImage} width={0} height={0} style={{ width: '90%', height: 'auto' }} sizes="100vw" alt="post image" className="mb-1 rounded-l" />}
                </Link>
                {note.length > 280 && !isExpanded ? (
                    <div dangerouslySetInnerHTML={{ __html: formatNote(note.slice(0, 280)) + "..." }}></div>
                ) : (
                    containsTwitterLink(note) ? (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: formatNote(note) }} />
                            <Tweet id={note.match(/\/status\/([0-9]+)/)[1]} />
                        </>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: formatNote(note) }} />
                    )
                )}
                {note.length > 280 && (
                    <div className="flex justify-end pr-2">
                        {!isExpanded && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpansion();
                                }}
                                className="text-black-400 dark:text-white hover:underline text-sm pl-2 pb-1"
                            >
                                <MdExpandMore className="h-6 w-6" />
                            </button>
                        )}
                        {isExpanded && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpansion();
                                }}
                                className="text-black-400 dark:text-white hover:underline text-sm pl-2 pb-1"
                            >
                                <MdExpandLess className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                )}
            </>
        )
    );
}

export default PostContent;
