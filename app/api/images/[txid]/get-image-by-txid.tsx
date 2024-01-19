import prisma from "@/app/db";
import { cache } from "react";

// Helper function to extract image caption and data using a regular expression
function extractCaptionAndImageData(note: string) {
  const regex = /(data:image\/[A-Za-z]+;base64,)(.*)/i;
  const match = note.match(regex);

  if (match && match.length === 3) {
      const imageData = match[0];
      return imageData;
  }

  // If the regular expression doesn't match, assume the entire string is image data
  return note;
}

export const getImageByTxid = cache(async (txid: string) => {
  const transaction = await prisma.transactions.findUnique({
      where: {
          txid,
      },
      select: {
          note: true,
      },
  });

  let imageData = '';

  if (transaction) {
      const note = transaction.note;

      if (note && note.includes("data:image/")) {
          imageData = extractCaptionAndImageData(note) || '';
      }
  }

  return { imageData };
});

