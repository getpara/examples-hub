import styled from 'styled-components';
import WarningIconMui from '@mui/icons-material/Warning';

export const Container = styled.div`
  border-radius: 8px;
  padding: 8px 12px 8px 10px;
  gap: 16px;
  display: flex;
  text-align: left;
`;

export const WarningIcon = styled(WarningIconMui)`
  && {
    color: rgba(255, 190, 76, 1);
    font-size: 15px;
  }
`;

export const Title = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(92, 61, 31, 1);
`;

export const Description = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(102, 109, 128, 1);
`;
