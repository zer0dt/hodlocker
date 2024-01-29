
import { getBitcoinerLikedData } from "@/app/components/posts/get-bitcoiner-avatar-rank";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {handle: string}}) {
    const bitcoiner = await getBitcoinerLikedData(params.handle);

    return new Response(JSON.stringify({ totalLikedFromOthers: bitcoiner?.totalLockLikedFromOthers }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}