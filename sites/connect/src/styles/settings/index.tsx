import { Container as InfoPanelContainer } from '@/components/base/InfoPanel/styles';
import styled from 'styled-components';

export const SettingOption = styled.div`
  width: 100%;
  padding: 24px;
  border-radius: 32px;
  gap: 8px;
  background: rgba(255, 255, 255, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid transparent;
  background-clip: padding-box;
  position: relative;

  background: linear-gradient(white, white) padding-box;

  &:hover {
    background:
      linear-gradient(white, white) padding-box,
      linear-gradient(to right, #8636f8, #f020b3, #f8475e, #ff9421) border-box;
  }
`;

export const SettingOptionHeader = styled.p`
  margin: 0;
  padding: 0;
  color: #000;
  font-family: Inter;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
`;

export const SettingOptionSubHeader = styled.p`
  margin: 0;
  padding: 0;
  color: #000;
  font-family: Inter;
  font-size: 16px;
  line-height: 24px;
  max-width: 336px;
  opacity: 0.5;
`;

export const SettingCardSubHeader = styled(SettingOptionSubHeader)`
  text-align: center;
  max-width: 448px;
  white-space: pre-line;
`;

export const SettingCard = styled(InfoPanelContainer)`
  padding: 16px 24px 24px 24px;
`;

export const SettingsCardContentContainer = styled.div`
  width: 100%;
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const FullWidthInputWrapper = styled.div`
  width: 100%;
  max-width: 496px;
`;
