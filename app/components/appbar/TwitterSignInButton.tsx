'use client'

import React from 'react'
import { signIn } from 'next-auth/react';
import { FaXTwitter } from 'react-icons/fa6';

const TwitterSignInButton = () => {
  const handleTwitterSignIn = async () => {
    await signIn('twitter');
  };

  return (
    <button onClick={handleTwitterSignIn} type="button" className="text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 mr-2 mb-2">
        <FaXTwitter className="h-5 w-5" />
       <span className="pl-4">Sign in with X</span> 
    </button>
  );
};

export default TwitterSignInButton;