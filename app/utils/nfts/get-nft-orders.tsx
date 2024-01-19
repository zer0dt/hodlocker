import { Suspense, cache } from 'react'
import NFTOrderComponent from '../../components/feeds/nfts-(not-used)/NFTOrderComponent';
import CollectionDropdown from '../../components/feeds/nfts-(not-used)/CollectionDropdown';
import NFTOrderPlaceholder from '../../components/feeds/nfts-(not-used)/NFTOrderPlaceholder';
 
export const dynamic = 'force-dynamic'

export const getNFTOrders = cache(async (collectionID: string) => {
  const url = 'https://staging-backend.relayx.com/api/market/' + collectionID + '/orders';
  
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      next: { revalidate: 0 }
    });

    const data = await res.json();

    const collection = data.data.token
    const orders = data.data.orders
    orders.sort((a, b) => a.satoshis - b.satoshis)
    const floorOrders = orders.slice(0, 21);

    const renderOrders = (
      <>
        <CollectionDropdown collectionInfo={collection} />
        {floorOrders.map((order: any) => (
          <Suspense fallback={<NFTOrderPlaceholder />}>
            <NFTOrderComponent
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






