import styled from 'styled-components';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const ToggleButton = styled.div`
  width: 195px;
  height: 44px;
  padding: 12px;
  border-radius: 8px, 8px, 0px, 0px;
  border: 2px;
  gap: 4px;
  cursor: pointer;
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
  box-shadow: 0px 0px 80px 0px #0000000d;
`;

export const Wrapper = styled.div`
  width: 100%;
  height: 244px;
  background-color: transparent;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: 768px) {
    height: 100%;
  }
`;

export const Container = styled.div`
  width: 966px;
  height: 200px;
  background: white;
  border-radius: 32px 32px 0px 0px;
  border: 2px solid;
  padding: 32px 64px 32px 64px;
  border-image-source: linear-gradient(
    154.91deg,
    rgba(255, 255, 255, 0.4) 7.86%,
    rgba(255, 255, 255, 0.0001) 38.83%,
    rgba(255, 255, 255, 0.0001) 51.7%,
    rgba(255, 255, 255, 0.1) 84.19%
  );
  box-shadow: 0px 0px 80px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    height: 100%;
    width: 100vw;
    padding: 32px;
  }
`;

export const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
`;

export const Icon = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
`;

export const InstructionArrowContainer = styled.div`
  width: 58px;
  height: 20px;
`;

export const InstructionArrow = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
`;

export const InstructionContainer = styled.div`
  max-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const TitleText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: 0em;
  text-align: center;
  color: black;
  margin-bottom: 15px;
`;

export const DescriptionText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 12px;
  font-weight: 300;
  line-height: 18px;
  letter-spacing: 0em;
  text-align: center;
  color: black;
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
  background: white;
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
`;

export const ChevronDown = styled(KeyboardArrowDownIcon)`
  && {
    font-size: 20px;
  }
`;

export const MobileStepCard = styled.div`
  width: 100%;
  padding: 16px 20px 16px 20px;
  border-radius: 16px;
  border: 1px;
  gap: 20px;
  display: flex;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid;
  border-image-source: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
  box-shadow: 0px 0px 80px 0px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  padding: 15px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const MobileNumberText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 14px;
  letter-spacing: -0.006em;
  color: rgba(248, 47, 181, 1);
  margin-bottom: 5px;
`;

export const MobileTitleText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: -0.015em;
  color: rgba(18, 18, 18, 1);
  margin-bottom: 10px;
`;

export const MobileDescriptionText = styled.p`
  margin: 0;
  padding: 0;
  font-family: Inter;
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  letter-spacing: -0.006em;
  color: rgba(0, 0, 0, 1);
`;
