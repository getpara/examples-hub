import styled from 'styled-components';

export const LabelText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  color: #09090b;
`;

export const ViewButton = styled.button`
  width: 140px;
  height: 32px;
  padding: 6px 8px 6px 8px;
  border-radius: 4px;
  gap: 4px;
  outline: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 1px 3px 0px #1212121a;
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.006em;
  border: none;
`;

export const LogoutButton = styled.button`
  outline: none;
  border: none;
  cursor: pointer;
  width: 48px;
  height: 48px;
  padding: 12px;
  border-radius: 12px;
  gap: 8px;
  background-color: var(--para-color-destructive);
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;
