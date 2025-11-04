import styled from 'styled-components';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const Container = styled.div`
  width: 400px;
  height: 256px;
  padding: 24px;
  border-radius: 32px;
  gap: 16px;
  box-shadow: 0px 12px 36px 0px rgba(47, 43, 67, 0.12);
  background: rgba(255, 255, 255, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;

  @media only screen and (max-width: 768px) {
    height: 300px;
  }
`;

export const IconContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background-color: black;
`;

export const TitleText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
  color: black;
`;

export const DescriptionText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 16px;
  font-weight: 300;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
  color: black;
`;

export const LinkText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
  color: rgba(18, 18, 18, 1);
`;

export const LinkArrow = styled(ArrowForwardIcon)`
  && {
    margin-left: 5px;
  }
`;

export const SvgContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
`;

export const ImageContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;
