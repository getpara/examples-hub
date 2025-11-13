import styled from 'styled-components';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const Container = styled.div`
  width: 100vw;
  display: flex;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

export const DrawerButton = styled.button`
  cursor: pointer;
  outline: none;
  width: 195px;
  height: 44px;
  padding: 12px;
  border-radius: 8px 8px 0px 0px;
  border: 2px;
  gap: 4px;
  background:
    linear-gradient(
      154.91deg,
      rgba(255, 255, 255, 0.4) 7.86%,
      rgba(255, 255, 255, 0.0001) 38.83%,
      rgba(255, 255, 255, 0.0001) 51.7%,
      rgba(255, 255, 255, 0.1) 84.19%
    ),
    linear-gradient(0deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4));
  border: 2px solid;
  border-image-source: linear-gradient(
    154.91deg,
    rgba(255, 255, 255, 0.4) 7.86%,
    rgba(255, 255, 255, 0.0001) 38.83%,
    rgba(255, 255, 255, 0.0001) 51.7%,
    rgba(255, 255, 255, 0.1) 84.19%
  );
  box-shadow: 0px 0px 80px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.006em;
  color: rgba(18, 18, 18, 1);

  @media (max-width: 768px) {
    width: 250px;
  }
`;

export const ChevronUp = styled(KeyboardArrowUpIcon)`
  && {
    font-size: 20px;
  }
`;

export const Link = styled.span`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.006em;
  cursor: pointer;
  color: rgba(18, 18, 18, 1);
`;

export const RightArrow = styled(ArrowForwardIcon)`
  && {
    font-size: 20px;
    margin-left: 5px;
  }
`;
