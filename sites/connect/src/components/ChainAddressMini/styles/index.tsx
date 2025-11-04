import styled from 'styled-components';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const Text = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: center;
  color: rgba(0, 0, 0, 1);
`;

export const CopyIcon = styled(ContentCopyIcon)`
  && {
    font-size: 10px;
    margin-left: 5px;
    cursor: pointer;
  }
`;
