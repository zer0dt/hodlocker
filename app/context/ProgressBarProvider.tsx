'use client';

import React from 'react';
import { Next13ProgressBar } from 'next13-progressbar';

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Next13ProgressBar height="4px" color="#FF9900" options={{ showSpinner: false }} showOnShallow />
    </>
  );
};

export default ProgressBarProvider;