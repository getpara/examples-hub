import React from 'react';
import styled from 'styled-components';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const StyledCard = styled.div`
  padding: 1.5rem;
  display: block;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 1.5rem;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0.25rem 0.75rem;
`;

export const Card: React.FC<CardProps> = ({ children, ...rest }) => {
  return <StyledCard {...rest}>{children}</StyledCard>;
};
