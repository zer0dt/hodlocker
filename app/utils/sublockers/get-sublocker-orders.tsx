import { Suspense, cache } from 'react'
import NFTBuyComponent from '../../components/feeds/nfts-(not-used)/NFTBuyComponent';
import NFTOrderPlaceholder from '../../components/feeds/nfts-(not-used)/NFTOrderPlaceholder';
import { unstable_noStore } from 'next/cache';
 

export const getSublockerOrders = cache(async (collectionID: string) => {
  const url = 'https://staging-backend.relayx.com/api/market/' + collectionID + '/orders';
  
  unstable_noStore()
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await res.json();

    const collection = data.data.token
    // Filter orders to only include those from the specified seller
    const ordersFromSeller = data.data.orders.filter(order => order.seller === '1A4maLtP3gu3fe7mCGre8S1vhNNqTcXqxH');
    // Then sort them by satoshis
    ordersFromSeller.sort((a, b) => b.satoshis - a.satoshis);

    const renderOrders = (
      <>
        {ordersFromSeller.map((order: any) => (
          <Suspense key={order.txid} fallback={<NFTOrderPlaceholder />}>
            <NFTBuyComponent
              key={order.txid}
              collection={collection}
              order={order}
            />
          </Suspense>
          
        ))}
      </>
    );

    return renderOrders;

  } catch (error) {
    throw error;
  }
  
});




