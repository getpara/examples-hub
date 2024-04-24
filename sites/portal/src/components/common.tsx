import { CpslIcon, CpslInput, CpslModal, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';

export const Heading: typeof CpslText = styled(CpslText)`
  text-align: center;
  font-size: 32px;
  line-height: 40px;
  font-weight: 500;
  letter-spacing: 0.96px;
`;

export const Text: typeof CpslText = styled(CpslText)`
  color: var(--cpsl-color-text-secondary);
  text-align: center;
  font-size: 16px;
  line-height: 24px;
  white-space: pre-line;
`;

export const Link = styled.a`
  color: var(--cpsl-color-text-secondary);
`;

export const Subheading: typeof CpslText = styled(Text)`
  width: 306px;
`;

export const StyledStrong = styled.strong`
  font-weight: 600;
`;

export const ButtonIcon: typeof CpslIcon = styled(CpslIcon)`
  display: flex;
  align-items: center;
  --height: 20px;
  --width: 20px;
`;

export const Hero: typeof CpslIcon = styled(CpslIcon)`
  box-sizing: content-box;
  align-self: center;
  --height: 64px;
  --width: 64px;

  padding: 8px 0px;
  margin: 16px 0px;

  @media (max-width: 550px) {
    margin-top: 0px;
    padding-top: 0px;
  }
`;

export const Modal: typeof CpslModal = styled(CpslModal)`
  @media (max-width: 550px) {
    --inner-container-padding-top: 40px;
    --inner-container-padding-bottom: 32px;

    height: 100vh;
    height: 100dvh;
    width: 100vw;
    width: 100dvw;
    max-width: none;
    border: none;
  }

  &::part(modal-container) {
    width: 430px;

    @media (max-width: 550px) {
      /* background-color: var(--cpsl-color-modal-surface-main); */
      height: 100vh;
      height: 100dvh;
      width: 100vw;
      width: 100dvw;
      max-width: none;
      max-height: none;
      border: none;
      border-radius: 0px;
      box-shadow: none;
    }
  }

  &::part(modal-inner-container) {
    @media (max-width: 550px) {
      display: flex;
      flex: 1;
      border-radius: 0px;
    }
  }

  &::part(modal-content) {
    @media (max-width: 550px) {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }
`;

export const FilledDisabledInput: typeof CpslInput = styled(CpslInput)`
  --container-border-color: var(--cpsl-color-input-border-placeholder);
  width: 334px;
`;
