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
  width: 44px;
  height: 44px;
  padding: 12px;
  border-radius: 12px;
  border: 1px;
  gap: 8px;
  angle: 0 deg;
  background:
    linear-gradient(0deg, #df1c41, #df1c41),
    radial-gradient(50% 93.75% at 50% 6.25%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%),
    radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid;
  border-image-source: radial-gradient(50% 93.75% at 50% 6.25%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  box-shadow: 0px 0px 0px 1px rgba(170, 46, 38, 1);
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;
