import { getBitcoinerSettings } from "@/app/utils/get-bitcoiner-settings";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { handle: string } }) {
    const settings = await getBitcoinerSettings(params.handle);

    if (settings === null) {
        return new Response(JSON.stringify({ settings: undefined }, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ settings }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}