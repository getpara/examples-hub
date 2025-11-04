import styled from 'styled-components';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export const LabelText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(18, 18, 18, 1);
  margin-bottom: 5px;
`;

export const CheckIcon = styled(CheckCircleIcon)`
  && {
    color: rgba(83, 180, 131, 1);
    font-size: 15px;
    margin-right: 3px;
  }
`;

export const CloseIcon = styled(CancelIcon)`
  && {
    color: rgba(243, 65, 65, 1);
    font-size: 15px;
    margin-right: 3px;
  }
`;

export const ListItemText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(18, 18, 18, 1);
`;
