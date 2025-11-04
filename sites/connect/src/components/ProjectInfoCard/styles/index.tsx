import styled from 'styled-components';
import MuiInfoIcon from '@mui/icons-material/Info';

export const NameText = styled.span`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.01em;
  text-align: center;
  color: rgba(18, 18, 18, 1);
  margin-botttom: 15px;
`;

export const WantsToConnectText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: center;
  color: rgba(18, 18, 18, 1);
`;

export const UrlText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: center;
  color: rgba(18, 18, 18, 1);
  cursor: pointer;
  margin-bottom: 15px;
`;

export const CannotVerifyPill = styled.div`
  width: 115px;
  height: 20px;
  radius: 999px;
  padding: 2px 8px 2px 2px;
  border-radius: 999px;
  border: 1px 1px 0px 1px;
  gap: 2px;
  background: rgba(242, 174, 64, 1);
  display: flex;
  align-items: center;
`;

export const CannotVerifyPillText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: center;
  color: rgba(255, 255, 255, 1);
  text-align: center;
`;

export const InfoIcon = styled(MuiInfoIcon)`
  && {
    color: white;
    font-size: 17px;
  }
`;
