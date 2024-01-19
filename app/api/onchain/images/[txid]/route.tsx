import { NextRequest } from "next/server";
import { getImage } from "./get-image";

export async function GET(request: NextRequest, {params}: {params: {txid: string}}) {
    const { txid } = params;

    // Use the getImageByTxid function to get the image data
    const { imageData } = await getImage(txid);

    if (imageData) {
        // Determine the image format based on the imageData
        let contentType;
        if (imageData.startsWith('data:image/jpeg')) {
            contentType = 'image/jpeg';
        } else if (imageData.startsWith('data:image/png')) {
            contentType = 'image/png';
        } else if (imageData.startsWith('data:image/gif')) {
            contentType = 'image/gif';
        } else if (imageData.startsWith('data:image/webp')) {
            contentType = 'image/webp';
        } else {
            // Handle other formats as needed
            contentType = 'application/octet-stream';
        }

        // Convert base64 data to Blob
        const base64Data = imageData.split(',')[1]; // Remove the data URI part
        const binaryData = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: contentType });

        // Set the Content-Type header based on the image format
        return new Response(blob, {
            headers: { 'Content-Type': contentType }
        });
    } else {
        // Handle the case where there's no image data
        return new Response('No image found', {
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}