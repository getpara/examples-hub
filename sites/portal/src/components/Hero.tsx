import { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

import Ring0DefaultSrc from '../assets/hero-default.png';
import Ring0LoadingSrc from '../assets/hero-loading.png';

type State = 'default' | 'loading' | 'success';

export const HERO_HEIGHT = 180;

const positioning = `
    position: absolute;
    top: 45px;
    left: 50%;
    transform: translate(-50%, -50%);
  `;

const ringStyles = (size: string, opacity: number, state: State = 'default') => `
  ${positioning}

  width: ${size};
  height: ${size};
  border-radius: ${size};
  flex-shrink: 0;
  transition: box-shadow 0.3s;
  box-shadow: ${state === 'success' ? '0px 0px 12px 0px rgba(219, 0, 51, 0.10)' : `0px 0px 20px rgba(0, 0, 0, ${opacity})`};
`;

const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  transform: translateY(-25%);
  left: 0;
  right: 0;
  z-index: 0;
`;

const Container = styled.div`
  position: relative;
  top: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: ${HERO_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Ring0 = styled.div<{ state: State }>`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  ${positioning}
  width: 160px;
  height: 160px;

  & img {
    width: 100%;
    height: 100%;
    animation: ${({ state }) => (state === 'loading' ? 'spin 2s linear infinite' : 'none')};
  }
`;

const Ring1 = styled.div<{ state: State }>`
  ${({ state }) => ringStyles('240px', 0.07, state)}
`;

const Ring2 = styled.div<{ state: State }>`
  ${({ state }) => ringStyles('360px', 0.05, state)}
`;

const Ring3 = styled.div<{ state: State }>`
  ${({ state }) => ringStyles('480px', 0.04, state)}
`;

const FadeOut = styled.div`
  position: fixed;
  height: 92px;
  right: 0;
  bottom: -10%;
  left: -62px;
  right: -62px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
`;

const LayoutContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  position: relative;
  flex: 1;
`;

export function Hero({ children, state = 'default' }: PropsWithChildren<{ state?: State; top?: number }>) {
  return (
    <Container>
      <Background>
        <Ring3 state={state} />
        <Ring2 state={state} />
        <Ring1 state={state} />
        <Ring0 state={state}>
          <img src={state === 'loading' ? Ring0LoadingSrc : Ring0DefaultSrc} />
        </Ring0>
        <FadeOut />
      </Background>
      <div style={{ zIndex: 1 }}>{children}</div>
    </Container>
  );
}

export function LayoutWithHero({
  hero,
  state = 'default',
  children,
}: PropsWithChildren<{ hero?: ReactNode; state: State }>) {
  return (
    <>
      <Hero state={state}>{hero}</Hero>
      <LayoutContainer>{children}</LayoutContainer>
    </>
  );
}
