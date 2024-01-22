'use client'

import React from 'react'

import UseAnimations from "react-useanimations";
import loading2 from 'react-useanimations/lib/loading2';

export default function Infinity() {
   
    return (
        <UseAnimations animation={loading2} size={100} strokeColor={"rgb(251, 146, 0)"} fillColor={"rgb(251, 146, 0)"} />
    )
  }