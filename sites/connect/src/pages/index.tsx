'use client';

import { useAccount } from '@getpara/react-sdk';
import { LandingHomePage } from '../components/LandingHomePage';
import { PageLoader } from '../components/PageLoader';
import { AuthedHomePage } from '../components/AuthedHomePage';

const HomePage = () => {
  const { isConnected, isLoading } = useAccount();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isConnected) {
    return <AuthedHomePage />;
  } else {
    return <LandingHomePage />;
  }
};

export default HomePage;
