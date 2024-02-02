import { getBitcoinersforLiked } from "../../../utils/get-bitcoiners-leaderboard";

export const revalidate = 600

export async function GET(request: Request) {
    const bitcoiners = await getBitcoinersforLiked();

    // Extract the desired properties from bitcoiners and assign ranks
    const extractedBitcoiners = bitcoiners.map(({ handle, created_at, totalLockLikedFromOthers }, index) => ({
        index: index + 1,
        handle,
        created_at,
        totalLockLikedFromOthers
    }));

    return new Response(JSON.stringify({ rankedBitcoiners: extractedBitcoiners }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}