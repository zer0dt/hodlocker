import { cache } from 'react'
 
export const revalidate = 30

export const fetchCurrentBlockHeight = cache(async (): Promise<number> => {

    console.log('getting block height')

    const url = 'https://api.bitails.io/block/latest';

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        mode: "cors"
      }, );
  
      if (!res.ok) {
        console.log("fetching current blockheight failed with status code " + res.status)
      }
  
      const data = await res.json();
  
      return data.height;
    } catch (error) {
      throw error;
    }
});



