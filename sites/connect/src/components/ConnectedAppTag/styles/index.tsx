import styled from 'styled-components';
import CancelIcon from '@mui/icons-material/Cancel';

export const Tag = styled.div`
  height: 32px;
  padding: 6px 12px 6px 8px;
  border-radius: 4px;
  gap: 4px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 1px 3px 0px rgba(18, 18, 18, 0.1);
  display: flex;
  align-items: center;
  position: relative;
`;

interface TagIconProps {
  backgroundImageUrl: string;
}

export const TagIcon = styled.div<TagIconProps>`
  width: 20px;
  height: 20px;
  border-radius: 100%;
  background-color: red;
  margin-right: 5px;
  background-image: url(${({ backgroundImageUrl }) => backgroundImageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export const TagImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 100%;
`;

export const TagName = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.006em;
  color: rgba(18, 18, 18, 1);
`;

export const DeleteTag = styled(CancelIcon)`
  && {
    position: absolute;
    color: rgba(202, 58, 49, 1);
    cursor: pointer;
    right: -10px;
    top: -10px;
  }
`;
