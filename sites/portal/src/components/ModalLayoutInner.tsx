import { PropsWithChildren } from 'react';
import { styled } from 'styled-components';
import { ModalFooter } from './ModalFooter';
import { isIFramed } from '../utils/isIFramed';

export const ModalLayoutInner = ({
  children,
  withFooter = false,
  styles = {},
}: PropsWithChildren<{ withFooter?: boolean; styles?: { container?: string; innerContainer?: string } }>) => {
  return (
    <Container $styles={styles?.container}>
      <InnerContainer $styles={styles?.innerContainer}>{children}</InnerContainer>
      {withFooter && <ModalFooter justifyContent="center" />}
    </Container>
  );
};

const Container = styled.div<{ $styles?: string }>`
  flex: 1;
  padding-top: 8px;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  max-height: calc(100% - var(--card-padding-top));
  ${({ $styles }) => $styles};
`;

const InnerContainer = styled.div<{ $styles?: string }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  ${!isIFramed && 'padding: 0px 24px'}
  overflow: auto;
  ${({ $styles }) => $styles};
`;
