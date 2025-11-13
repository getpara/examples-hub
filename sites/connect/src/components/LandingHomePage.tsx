'use client';

import { ParaModal } from '@getpara/react-sdk';
import { Typography } from '@getpara/react-component-library';

export const LandingHomePage = () => {
  return (
    <>
      <div className="para:flex para:flex-col para:gap-2 para:items-center para:pt-9">
        <Typography className="para:text-4xl para:font-semibold para:text-center">Manage your wallets</Typography>
        <Typography color="secondary" className="para:font-medium para:text-center">
          Connect to apps, export, and manage your wallet security.
        </Typography>
      </div>
      <div className="para:flex para:flex-col para:gap-4 para:flex-1 para:items-center para:w-full para:px-2 para:pb-9 para:pt-6">
        <ParaModal className="custom-modal" />
      </div>
    </>
  );
};
