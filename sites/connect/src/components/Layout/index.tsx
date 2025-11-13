import { Loading } from '@nextui-org/react';
import { ReactNode } from 'react';

import { useAccount } from '@getpara/react-sdk';
import { PageWrapper } from '../PageWrapper';
import { AuthedAppBar } from '../appBars/AuthedAppBar';
import { LandingAppBar } from '../appBars/LandingAppBar';

/**
 * Types
 */
interface Props {
  initialized: boolean;
  children: ReactNode | ReactNode[];
}

/**
 * Container
 */
export default function Layout({ children, initialized }: Props) {
  const { isConnected, isLoading } = useAccount();

  return (
    <>
      {initialized ? (
        <PageWrapper>
          {isConnected && !isLoading ? (
            <>
              <AuthedAppBar />
              {children}
            </>
          ) : (
            <>
              <LandingAppBar />
              {children}
            </>
          )}
        </PageWrapper>
      ) : (
        <Loading />
      )}
    </>
  );
}
