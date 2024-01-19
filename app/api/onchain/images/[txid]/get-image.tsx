import { cache } from "react";
import axios from 'axios';
import bsv from 'bsv';

// Helper function to parse script and extract data using bsv.js
function parseScript(scriptHex) {

    const script = new bsv.Script(scriptHex);
    const dataOut = script.getData();

    return dataOut ? dataOut.toString() : null;
}

// Helper function to extract image data using a regular expression
function extractImageData(scriptData) {
    const regex = /(data:image\/[A-Za-z]+;base64,)(.*)/i;
    const match = scriptData.match(regex);

    if (match && match.length === 3) {
        const imageData = match[0];
        return imageData;
    }

    return null; // If the regular expression doesn't match, return null
}

export const getImage = cache(async (txid: string, outputIndex = 1) => {
    let imageData = '';

    try {
        const apiUrl = `https://api.bitails.io/download/tx/${txid}/output/${outputIndex}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'text/markdown'
            }
        });

        if (response.data) {
            imageData = extractImageData(response.data);
        }
    } catch (error) {
        console.error("Error in getImage:", error);
    }

    return { imageData };
});
