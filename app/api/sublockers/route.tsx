import { getAllTags } from "@/app/utils/sublockers/get-tags";

export const revalidate = 0

export async function GET(request: Request) {
    const subs = await getAllTags()

    // Prepare the data to return
    const responseData = {
        sublockers: subs
    };

    return new Response(JSON.stringify(responseData, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}

