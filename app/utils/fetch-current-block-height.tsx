import { cache } from 'react'

export const fetchCurrentBlockHeight = cache(async (): Promise<number> => {

    console.log('getting block height')

    const url = 'https://api.bitails.io/block/latest';

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        mode: "cors",
        next: {
          revalidate: 30
        }
      },  );
  
      if (!res.ok) {
        console.log("fetching current blockheight failed with status code " + res.status)
      }
  

      const data = await res.json();
  
      console.log("current blockheight: " + data.height)
      return data.height;
    } catch (error) {
      throw error;
    }
});



