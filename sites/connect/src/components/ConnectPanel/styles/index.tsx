import styled from 'styled-components';
import { Flex } from 'rebass';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import InfoIconMui from '@mui/icons-material/Info';

export const FullWidthContainer = styled(Flex)`
  && {
    width: 100%;
    justify-content: center;
  }
`;

export const HeaderText = styled.p`
  margin: 0;
  padding: 0;
  color: #121212;
  font-family: Inter;
  font-size: 32px;
  font-weight: 500;
  line-height: 38px;
  letter-spacing: -0.015em;
  text-align: center;
`;

export const SubheaderText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 18px;
  font-weight: 200;
  line-height: 27px;
  letter-spacing: 0em;
  text-align: center;
  color: #000000;
`;

export const FooterText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 16px;
  font-weight: 200;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: center;
  color: #000000;
`;

export const BoldText = styled.span`
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: center;
  color: #000000;
  cursor: pointer;
  text-decoration: underline;
`;

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

export const ScanIcon = styled(DocumentScannerIcon)`
  && {
    margin-right: 5px;
  }
`;

export const InfoIcon = styled(InfoIconMui)`
  && {
    font-size: 15px;
    color: rgba(0, 0, 0, 1);
    margin-left: 5px;
  }
`;

export const TooltipDescription = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 12px;
  font-weight: 300;
  line-height: 16px;
  letter-spacing: 0em;
  color: rgba(255, 255, 255, 1);
`;
