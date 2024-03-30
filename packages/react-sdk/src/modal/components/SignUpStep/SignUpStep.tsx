import {
  CpslButton,
  CpslDivider,
  CpslIcon,
  CpslInput,
} from '@usecapsule/react-components';
import {
  CpslInputCustomEvent,
  InputInputEventDetail,
} from '@usecapsule/core-components';
import { useState } from 'react';
import styled from 'styled-components';
import { OAuth } from '../OAuth/OAuth';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { ModalStep } from '../../utils/steps';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores';
import { useThemeStore } from '../../stores/theme/useThemeStore';
import { CapsuleBlack, CapsuleWhite } from '../Icons';
import { Theme } from '../../types/theme';

interface SignUpStepProps {
  oAuthMethods?: OAuthMethod[];
}

export const SignUpStep = ({ oAuthMethods }: SignUpStepProps) => {
  const theme = useThemeStore((state) => state.theme);
  const logo = useThemeStore((state) => state.getLogo());
  const appName = useThemeStore((state) => state.appName);
  const capsule = useCapsuleStore((state) => state.capsule);
  const setFlow = useModalStore((state) => state.setFlow);
  const setStep = useModalStore((state) => state.setStep);
  const showAllOAuth = useModalStore(
    (state) => state.step === ModalStep.SIGN_UP_ALL_OAUTH,
  );
  const setEmail = useUserInfoStore((state) => state.setEmail);
  const email = useUserInfoStore((state) => state.email);
  const setWebAuthURLForLogin = useModalStore(
    (state) => state.setWebAuthURLForLogin,
  );

  const [emailError, setEmailError] = useState('');

  const handleSubmitEmail = async () => {
    if (!email) {
      setEmailError('Email is required!');
      return;
    }

    if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email,
      )
    ) {
      setEmailError('Please enter a valid email!');
      return;
    }

    await capsule.logout();

    const userExists = await capsule.checkIfUserExists(email);
    if (userExists) {
      const webAuthUrlForLogin = await capsule.initiateUserLogin(email);
      setFlow('login');
      setStep(ModalStep.BIOMETRIC_LOGIN);
      setWebAuthURLForLogin(webAuthUrlForLogin);
      return;
    }

    await capsule.createUser(email);
    setFlow('signUp');
    setStep(ModalStep.VERIFICATION_CODE);
  };

  const handleEmailInput = (
    ev: CpslInputCustomEvent<InputInputEventDetail>,
  ) => {
    setEmailError('');
    setEmail(ev.detail.value);
  };

  return (
    <>
      {!showAllOAuth &&
        (logo ? (
          <Logo src={logo} alt={`${appName ? `${appName} -` : ''}logo`} />
        ) : (
          <LogoSvg>
            {theme === Theme.dark ? <CapsuleWhite /> : <CapsuleBlack />}
          </LogoSvg>
        ))}
      {!!oAuthMethods?.length && (
        <>
          <OAuth methods={oAuthMethods} />
          <CpslDivider>or</CpslDivider>
        </>
      )}
      <CpslInput
        placeholder="Enter your email"
        onCpslInput={handleEmailInput}
        value={email}
        errorText={emailError}
        autofocus
      >
        <CpslIcon slot="start" icon="mail" />
        <CpslButton slot="end" onClick={handleSubmitEmail}>
          <CpslIcon icon="arrow" />
        </CpslButton>
      </CpslInput>
    </>
  );
};

const Logo = styled.img`
  height: 100px;
  max-width: 260px;
  object-fit: contain;
  padding: 16px 0px;
  margin: 16px 0px;
  box-sizing: content-box;
  align-self: center;
`;

const LogoSvg = styled.div`
  height: 100px;
  max-width: 260px;
  padding: 16px 0px;
  margin: 16px 0px;
  align-self: center;

  svg {
    width: 100%;
  }
`;
