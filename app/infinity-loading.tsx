'use client'

import React from 'react'

import UseAnimations from "react-useanimations";
import infinity from 'react-useanimations/lib/infinity';

export default function Infinity() {
   
    return (
        <UseAnimations animation={infinity} size={56} />
    )
  }