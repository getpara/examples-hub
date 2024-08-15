import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Color, getBackground, stringToBinaryAndColor } from '../utils/identicon';

const SingleArc = () => (
  <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_674_66)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_674_66">
        <rect width="12" height="12" />
      </clipPath>
    </defs>
  </svg>
);

const DoubleArc = () => (
  <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_674_255)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_674_255">
        <rect width="12" height="12" />
      </clipPath>
    </defs>
  </svg>
);

export const Identicon = ({
  address,
  size = '40px',
  ...props
}: { address: string; size?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  const [color, shapes, rotations]: [Color, boolean[], number[]] = useMemo(() => {
    const [code, color] = stringToBinaryAndColor(address);
    const shapeA = ((code >> 2) & 1) !== 0;
    const shapeB = ((code >> 3) & 1) !== 0;
    const shapeC = ((code >> 4) & 1) !== 0;
    const shapeD = ((code >> 5) & 1) !== 0;
    const rotationA = (code >> 6) & 3;
    const rotationB = (code >> 7) & 3;
    const rotationC = (code >> 8) & 3;
    const rotationD = (code >> 9) & 3;

    return [color, [shapeA, shapeB, shapeC, shapeD], [rotationA, rotationB, rotationC, rotationD]];
  }, [address]);

  return (
    <IdenticonBase {...props} size={size} color={color} rotations={rotations}>
      {shapes.map((isDouble, index) => (isDouble ? <DoubleArc key={index} /> : <SingleArc key={index} />))}
    </IdenticonBase>
  );
};

const IdenticonBase = styled.div<{ size?: string; color: Color; rotations: number[] }>`
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  border-radius: 6px;
  position: relative;
  border: 1px solid var(--cpsl-color-background-8);
  background: ${({ color }) => getBackground(color)};

  & > svg {
    fill: rgba(255, 255, 255, 0.6);
    position: absolute;
    width: 35%;
  }

  & > svg:nth-child(1) {
    right: 50%;
    bottom: 50%;
    transform: ${({ rotations: [rotation] }) => `rotate(${rotation * 0.25}turn)`};
  }

  & > svg:nth-child(2) {
    left: 50%;
    bottom: 50%;
    transform: ${({ rotations: [, rotation] }) => `rotate(${rotation * 0.25}turn)`};
  }

  & > svg:nth-child(3) {
    right: 50%;
    top: 50%;
    transform: ${({ rotations: [, , rotation] }) => `rotate(${rotation * 0.25}turn)`};
  }

  & > svg:nth-child(4) {
    left: 50%;
    top: 50%;
    transform: ${({ rotations: [, , , rotation] }) => `rotate(${rotation * 0.25}turn)`};
  }
`;
