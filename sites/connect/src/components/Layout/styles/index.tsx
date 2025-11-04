import styled from 'styled-components';

export const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  position: relative;
`;

export const Background = styled.img`
  flex: 1;
  height: 100%;
  width: 100%;
  object-fit: cover;
  z-index: -1;
`;

export const BackgroundContainer = styled.div`
  display: flex;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;
