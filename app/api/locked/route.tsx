
import { getAllBitcoinLocked } from '@/app/utils/get-all-bitcoin-locked';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const bitcoinLocked = await getAllBitcoinLocked()

    // Prepare the data to return
    const responseData = {
        bitcoinLocked: bitcoinLocked.toFixed(2)
    };

    return new Response(JSON.stringify(responseData, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}

