"use client";

import { useContext, useState } from "react";
import { RelayOneContext } from "../../../context/WalletContextProvider";
import { toast } from "sonner";
import { ThreeDots } from "react-loader-spinner";


interface NFTBuyProps {
  collection: any;
  order: any;
}

function NFTBuyComponent({ collection, order }: NFTBuyProps) {
  const { paymail } = useContext(RelayOneContext)!;

  const [loading, setLoading] = useState(false);

  const buyItem = async (collection: any, order: any) => {
    setLoading(true)

    const response = await fetch("https://api.relayx.io/v1/paymail/run/" + paymail)
    const data = await response.json()
    const buyerRUNAddress = data.data
    console.log(buyerRUNAddress)

    const address = buyerRUNAddress
    const location = collection.origin
    const txid = order.txid

    const url = "https://staging-backend.relayx.com/api/dex/buy";

    console.log(address, location, txid)

    try {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                address,
                location,
                txid
            }),
            headers: {
                "Content-Type": "application/json",                
            }
        });

        console.log(res)

        if (!res.ok) {
            setLoading(false)
            throw new Error('Failed to fetch data');            
        }

        const data = await res.json();

        console.log(data.data.rawtx)

        const rawtx = data.data.rawtx

        relayone.send(rawtx).catch(e => {
            if (e) {
                console.log(e.message)
                toast.error(e.message)
                setLoading(false)
                throw Error(e)
            }
            setLoading(false)
        }) 
        
        
        
    } catch (error) {
        console.log(error)
        setLoading(false)
        toast.error(error)
    }
  }

  const image = "https://berry2.relayx.com/" + order.berry.txid;

  const spinner = () => {
    return (
      <>
        <div className="justify-center items-center flex">
          <ThreeDots
            height="2em"
            width="2em"
            radius="4"
            color="#FFFFFF"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            visible={true}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 grid grid-cols-4">
        <div className="col-span-1">
          <img
            className="rounded-l-lg w-full"
            src={image}
            alt="product image"
          />
        </div>
        <div className="col-span-2 flex flex-col justify-start px-2 pt-2">
          <h5 className="text-l font-semibold text-gray-900 dark:text-white">
            {collection.name} #{order.props.no}
          </h5>
          <div className="flex items-center">
            {" "}
            {/* Added a flex container */}
            <span className="text-md font-bold text-gray-900 dark:text-white">
              {order.satoshis / 100000000}
            </span>
            <img
              src="/bitcoin.png"
              className="w-5 h-5 ml-1"
              alt="Bitcoin icon"
            />{" "}
            {/* Adjusted styling */}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {order.seller.slice(0, 7) + "..."}
          </p>
        </div>
        <div className="pr-4 col-span-1 flex items-center justify-center">
          <button
            onClick={() => {
              buyItem(collection, order);
            }}
            className="text-white bg-orange-400 hover:bg-orange-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {loading ? spinner() : "Unlock"}
          </button>
        </div>
      </div>
    </>
  );
}

export default NFTBuyComponent;
