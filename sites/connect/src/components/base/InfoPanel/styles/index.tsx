import styled from 'styled-components';

interface ContainerProps {
  isMobile: boolean;
}

export const Container = styled.div<ContainerProps>`
  width: ${({ isMobile }) => (isMobile ? '340px' : '561px')};
  border-radius: 32px;
  border: 2px solid;
  background:
    linear-gradient(
      154.91deg,
      rgba(255, 255, 255, 0.4) 7.86%,
      rgba(255, 255, 255, 0.0001) 38.83%,
      rgba(255, 255, 255, 0.0001) 51.7%,
      rgba(255, 255, 255, 0.1) 84.19%
    ),
    linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4));
  border-image-source: linear-gradient(
    154.91deg,
    rgba(255, 255, 255, 0.4) 7.86%,
    rgba(255, 255, 255, 0.0001) 38.83%,
    rgba(255, 255, 255, 0.0001) 51.7%,
    rgba(255, 255, 255, 0.1) 84.19%
  );
  gap: 48px;
  box-shadow: 0px 0px 80px 0px #0000000d;
`;
