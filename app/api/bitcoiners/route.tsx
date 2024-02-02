
import { getBitcoinersforLocked } from "@/app/utils/get-bitcoiners-leaderboard";

export const dynamic = 'force-dynamic'

export type RankedBitcoiners =  {
    index: number;
    handle: string;
    created_at: Date;
    totalAmountLocked: any;
}[]

export async function GET(request: Request) {
    const bitcoiners = await getBitcoinersforLocked();

    // Extract the desired properties from bitcoiners and assign ranks
    const extractedBitcoiners = bitcoiners.map(({ handle, created_at, totalAmountLocked }, index) => ({
        index: index + 1,
        handle,
        created_at,
        totalAmountLocked
    }));

    return new Response(JSON.stringify({ rankedBitcoiners: extractedBitcoiners }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}






