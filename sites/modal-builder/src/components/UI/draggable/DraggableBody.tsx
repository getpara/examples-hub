import React from 'react';
import styled from 'styled-components';

export interface DraggableBodyProps {
  children: React.ReactNode;
  isExpanded: boolean;
}

export const DraggableBody: React.FC<DraggableBodyProps> = ({ children, isExpanded }) => {
  return (
    <BodyContainer className="draggable-body" $isExpanded={isExpanded}>
      <BodyContent>{children}</BodyContent>
    </BodyContainer>
  );
};

const BodyContainer = styled.div<{ $isExpanded: boolean }>`
  overflow: hidden;
  transition:
    max-height 0.3s ease-out,
    opacity 0.3s ease-out;
  max-height: ${({ $isExpanded }) => ($isExpanded ? '1000px' : '0')};
  opacity: ${({ $isExpanded }) => ($isExpanded ? '1' : '0')};
`;

const BodyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
`;
