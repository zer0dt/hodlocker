import { cache } from 'react'
 
export const dynamic = 'force-dynamic'

export const getBitcoinPrice = cache(async (): Promise<number> => {
  const url = 'https://api.whatsonchain.com/v1/bsv/main/exchangerate';
  const apiKey = process.env.WHATSONCHAIN_API_KEY as string;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        'Authorization': apiKey
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await res.json();
    return data.rate;
  } catch (error) {
    throw error;
  }
  
});



