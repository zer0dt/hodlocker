
'use client'

import Script from 'next/script';
import React, { createContext, useState, useContext, useEffect } from 'react';

import { fetchCurrentBlockHeight } from '@/app/utils/fetch-current-block-height'
import { BitcoinerSettings } from '../utils/get-bitcoiner-settings';

import { useSession } from "next-auth/react";
import { getBitcoinerByTwitterId, postNewBitcoiner } from '../server-actions';

const WalletTypes = {
  None: 'NONE',
  RelayX: 'RELAYX',
  Panda: 'PANDA',
};

declare global {
  let relayone: RelayOneInterface;
}

interface RelayOneInterface {
  authBeta: (withGrant?: boolean) => Promise<any>;
  isLinked: () => Promise<boolean>;
  send: (props: Object) => Promise<SendResult>;
  getBalance2: () => Promise<string>
  requestIdentity: () => Promise<string>
}

interface SendResult {
  txid: string;
  rawTx: string;
  amount: number; // amount spent in button currency
  currency: string; // button currency
  satoshis: number; // amount spent in sats
  paymail: string; // user paymail deprecated
  identity: string; // user pki deprecated
}


interface WalletContextType {
  fetchRelayOneData: () => Promise<void>
  pubkey: string | undefined,
  handle: string | null | undefined,
  avatar: string | null | undefined,
  twitterId: string | null | undefined,
  userBalance: string | undefined,
  paymail: string | undefined,
  isLinked: boolean | undefined,
  bitcoinerSettings: BitcoinerSettings | undefined,
  setBitcoinerSettings: React.Dispatch<React.SetStateAction<BitcoinerSettings | undefined>>,
  currentBlockHeight: number | undefined,
  signInModalVisible: boolean,
  setSignInModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
}


export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useRelayOne must be used within a RelayOneProvider');
  }
  return context;
};

export const WalletContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();

  const [handle, setHandle] = useState<string | null | undefined>(undefined)
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined)
  const [twitterId, setTwitterId] = useState<string | null | undefined>(undefined)
  const [userBalance, setUserBalance] = useState<string | undefined>(undefined)
  const [paymail, setPaymail] = useState<string | undefined>(undefined)
  const [pubkey, setPubkey] = useState<string | undefined>(undefined)
  const [bitcoinerSettings, setBitcoinerSettings] = useState<BitcoinerSettings | undefined>(undefined)
  const [isLinked, setIsLinked] = useState<boolean | undefined>(undefined)
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | undefined>(undefined)
  const [signInModalVisible, setSignInModalVisible] = useState(false);

  useEffect(() => {
    console.log(session)

    if (session && session.user && session.user.name && session.user.id) {
      const getTwitterBitcoiner = async () => {
        const bitcoiner = await getBitcoinerByTwitterId(session.user.id)
        if (bitcoiner) {
          setHandle(bitcoiner.handle)
          setPaymail(bitcoiner.handle + "@hodlocker.com")
          setAvatar(session.user.image)
          setTwitterId(session.user.id)
        } else {
          const bitcoiner = await postNewBitcoiner(session.user.name, session.user.id, "")
          if (bitcoiner.twitterId) {
            setHandle(bitcoiner.handle)
            setPaymail(bitcoiner.handle + "@hodlocker.com")
            setAvatar(session.user.image)
            setTwitterId(session.user.id)
          } else {
            alert("Error: couldn't create new bitcoiner using X.com login")
          }
        }
      }

      getTwitterBitcoiner()
    }
  }, [session])

  const checkIfLinked = async () => {
    const isLinked = await relayone.isLinked()

    if (isLinked) {
      fetchRelayOneData()
    } else if (!isLinked) {
      setIsLinked(false)
    }

    console.log("going to check block height")
    const currentBlockHeight = await fetchCurrentBlockHeight()
    setCurrentBlockHeight(currentBlockHeight)
  }

  const fetchRelayOneData = async () => {

    const isLinked = await relayone.isLinked()
    setIsLinked(isLinked)

    try {
      const token = await relayone.authBeta(false);
      const [payload, signature] = token.split(".");
      const data = JSON.parse(atob(payload));

      console.log("data", data)

      setPaymail(data.paymail);
      const handle = data.paymail.substring(0, data.paymail.lastIndexOf("@"))
      setHandle(handle);
      setAvatar("https://a.relayx.com/u/" + data.paymail)
      setPubkey(data.pubkey);

      const balance = await relayone.getBalance2();
      setUserBalance((balance.satoshis / 100000000).toFixed(2).toString())

      const response = await fetch(`/api/bitcoiners/settings/${handle}`, {
        cache: "no-store"
      });
      const responseJson = await response.json();
      console.log(responseJson);
      if (responseJson) {
        setBitcoinerSettings(responseJson.settings);
      }

      const loggedInBitcoiner = {
        handle: data.paymail.substring(0, data.paymail.lastIndexOf("@")),
        balance: (balance.satoshis / 100000000).toFixed(2).toString(),
        paymail: data.paymail,
        pubkey: data.pubkey
      }

      console.log(loggedInBitcoiner)

    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
        alert('An error occurred');
      }
    }
  };

  return (
    <>
      <Script src="https://one.relayx.io/relayone.js" onLoad={() => checkIfLinked()} />
      <WalletContext.Provider value={{ fetchRelayOneData, pubkey, handle, avatar, twitterId, userBalance, paymail, isLinked, bitcoinerSettings, setBitcoinerSettings, currentBlockHeight, signInModalVisible, setSignInModalVisible }}>
        {children}
      </WalletContext.Provider>
    </>
  );
};

