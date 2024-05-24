import { ReactNode, useState } from 'react';
import { CpslButton, CpslDivider, CpslDropdown, CpslIcon, CpslInput } from '@usecapsule/react-components';
import {
  CpslDropdownCustomEvent,
  CpslInputCustomEvent,
  DropdownInputEventDetail,
  IconType,
  InputInputEventDetail,
} from '@usecapsule/core-components';
import styled from 'styled-components';
import { OAuth } from '../OAuth/OAuth.js';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { ModalStep } from '../../utils/steps.js';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { CapsuleBlack, CapsuleWhite } from '../Icons.js';
import countryCodes from './countryCodes.js';
import parsePhoneNumberFromString, { CountryCallingCode } from 'libphonenumber-js';

interface SignUpStepProps {
  oAuthMethods?: OAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
}

const DEFAULT_COUNTRY = { label: 'United States', value: '+1', selectedLabel: 'US', icon: 'US' as IconType };

export const SignUpStep = ({ oAuthMethods, disableEmailLogin, disablePhoneLogin }: SignUpStepProps) => {
  const isDark = useThemeStore((state) => state.isDark);
  const logo = useThemeStore((state) => state.getLogo());
  const appName = useThemeStore((state) => state.appName);
  const capsule = useCapsuleStore((state) => state.capsule);
  const setFlow = useModalStore((state) => state.setFlow);
  const setStep = useModalStore((state) => state.setStep);
  const showAllOAuth = useModalStore((state) => state.step === ModalStep.SIGN_UP_ALL_OAUTH);
  const setEmail = useUserInfoStore((state) => state.setEmail);
  const email = useUserInfoStore((state) => state.email);
  const setPhone = useUserInfoStore((state) => state.setPhone);
  const phone = useUserInfoStore((state) => state.phone);
  const setCountryCode = useUserInfoStore((state) => state.setCountryCode);
  const countryCode = useUserInfoStore((state) => state.countryCode);
  const setWebAuthURLForLogin = useModalStore((state) => state.setWebAuthURLForLogin);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [matchedCountryCode, setMatchedCountryCode] = useState<DropdownInputEventDetail>(DEFAULT_COUNTRY);

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

  const handleSubmitPhone = async () => {
    if (!phone) {
      setPhoneError('Phone is required!');
      return;
    }

    await capsule.logout();

    let userExists = false;

    try {
      userExists = await capsule.checkIfUserExistsByPhone(phone, countryCode);
    } catch (error) {
      setPhoneError('Phone number is not valid!');
      return;
    }

    if (userExists) {
      const webAuthUrlForLogin = await capsule.initiateUserLoginForPhone(phone, countryCode);
      setFlow('login');
      setStep(ModalStep.BIOMETRIC_LOGIN);
      setWebAuthURLForLogin(webAuthUrlForLogin);
      return;
    }

    await capsule.createUserByPhone(phone, countryCode);
    setFlow('signUp');
    setStep(ModalStep.VERIFICATION_CODE_FOR_PHONE);
  };

  const handleEmailInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setEmailError('');
    setEmail(ev.detail.value);
  };

  const handlePhoneInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPhoneError('');
    if (!checkAndSetPhoneNumberFromStringDidChange(ev.detail.value)) {
      setPhone(ev.detail.value);
    }
  };

  const handleCountryCodeInput = (ev: CpslDropdownCustomEvent<DropdownInputEventDetail>) => {
    const matchedCountryCode = countryCodes.find((code) => code.selectedLabel === ev.detail.selectedLabel);
    setCountryCode(ev.detail.value as CountryCallingCode);
    setMatchedCountryCode(matchedCountryCode);
  };

  // TODO: rename this function
  const checkAndSetPhoneNumberFromStringDidChange = (inputPhone: string): boolean => {
    const phoneNumber = parsePhoneNumberFromString(inputPhone);

    if (phoneNumber) {
      const countryCode = phoneNumber.country;
      const nationalNumber = phoneNumber.formatNational();

      const matchedCountryCode = countryCodes.find((code) => code.selectedLabel === countryCode);

      if (matchedCountryCode) {
        setCountryCode(matchedCountryCode.value as CountryCallingCode);
        setPhone(nationalNumber);
        setMatchedCountryCode(matchedCountryCode);
        return true;
      }
    }

    return false;
  };

  const handlePasteInput = (ev: CpslInputCustomEvent<ClipboardEvent>) => {
    const clipboardEvent = ev.detail;
    const paste = clipboardEvent.clipboardData?.getData('text');

    if (paste) {
      checkAndSetPhoneNumberFromStringDidChange(paste);
    }
  };

  const methodsToShow = (): ReactNode[] => {
    const methods = [];
    if (!!oAuthMethods?.length) {
      methods.push(
        <>
          <OAuth methods={oAuthMethods} />
        </>,
      );
    }

    if (!disableEmailLogin) {
      if (methods.length > 0) {
        methods.push(<CpslDivider>or</CpslDivider>);
      }
      methods.push(
        <CpslInput
          placeholder="Enter your email"
          onCpslInput={handleEmailInput}
          value={email}
          errorText={emailError}
          autofocus
          inputMode="email"
        >
          <CpslIcon slot="start" icon="mail" />
          <CpslButton slot="end" onClick={handleSubmitEmail}>
            <CpslIcon icon="arrow" />
          </CpslButton>
        </CpslInput>,
      );
    }

    if (!disablePhoneLogin) {
      if (methods.length > 0) {
        methods.push(<CpslDivider>or</CpslDivider>);
      }
      methods.push(
        <CpslInput
          placeholder="Enter phone number"
          inputMode="tel"
          autofocus
          value={phone}
          errorText={phoneError}
          onCpslInput={handlePhoneInput}
          onCpslPaste={handlePasteInput}
        >
          <CpslDropdown
            hasCpslSearch={true}
            selectedItem={matchedCountryCode}
            onSelectedItemChange={handleCountryCodeInput}
            slot="start"
            items={countryCodes}
          />
          <CpslButton slot="end" onClick={handleSubmitPhone}>
            <CpslIcon icon="arrow" />
          </CpslButton>
        </CpslInput>,
      );
    }

    return methods;
  };

  return (
    <>
      {!showAllOAuth &&
        (logo ? (
          <Logo src={logo} alt={`${appName ? `${appName} -` : ''}logo`} />
        ) : (
          <LogoSvg>{isDark ? <CapsuleWhite /> : <CapsuleBlack />}</LogoSvg>
        ))}
      {methodsToShow()}
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
