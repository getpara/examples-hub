import RouteTransition from '@/components/RouteTransition';
import { Loading } from '@nextui-org/react';
import { ReactNode } from 'react';

import * as Styled from './styles';
import Navbar from '../base/Navbar';

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
  return (
    <>
      {initialized ? (
        <Styled.Container>
          <Navbar />
          <RouteTransition>{children}</RouteTransition>
          <Styled.BackgroundContainer>
            <Styled.Background src={'/background.png'} alt="Background Image" />
          </Styled.BackgroundContainer>
        </Styled.Container>
      ) : (
        <Loading />
      )}
    </>
  );
}
