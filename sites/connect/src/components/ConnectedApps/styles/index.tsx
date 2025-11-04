import styled from 'styled-components';

interface ContainerProps {
  hasApps: boolean;
}

export const Container = styled.div<ContainerProps>`
  min-height: 112px;
  width: 100%;
  padding: 16px 20px 16px 20px;
  border-radius: 8px;
  border: 1px;
  gap: 24px;
  box-shadow: 0px 0px 20px 0px #0000000f;
  display: flex;
  align-items: ${({ hasApps }) => (hasApps ? 'flex-start' : 'center')};
  justify-content: center;
  flex-wrap: wrap;
`;

export const EmptyStateText = styled.p`
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: -0.006em;
  text-align: center;
  margin: 0;
  padding: 0;
  color: rgba(18, 18, 18, 1);
`;
