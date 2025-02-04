import {
  CpslInputCustomEvent,
  CpslSelectCustomEvent,
  DropdownInputEventDetail,
  IconType,
  InputInputEventDetail,
} from '@getpara/core-components';
import {
  CpslButton,
  CpslIcon,
  CpslInput,
  CpslSelect,
  CpslSelectItem,
  CpslSpinner,
  CpslText,
} from '@getpara/react-components';
import { CountryCallingCode } from 'libphonenumber-js';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import countryCodes from './countryCodes.js';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { EMAIL_REGEX, MOBILE_SIZE } from '../../constants/constants.js';
import { useDropdownPosition } from './hooks/useDropdownPosition.js';
import { ModalStep } from '../../utils/steps.js';
import { defaultPhoneMask, phoneMasks } from './phoneMasks.js';
import { AuthMethod } from '@getpara/web-sdk';
import { AuthType } from '@getpara/user-management-client';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

interface AuthInputProps {
  disableEmailLogin?: boolean;
  disablePhoneLogin?: boolean;
}

const DEFAULT_COUNTRY = { label: 'United States', value: '+1', selectedLabel: 'US', icon: 'US' as IconType };

export const AuthInput = ({ disableEmailLogin, disablePhoneLogin }: AuthInputProps) => {
  const inputRef = useRef<HTMLCpslInputElement>(null);
  const { dropdownMaxHeight, dropdownWidth } = useDropdownPosition(inputRef);

  const para = useInternalClient();
  const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);
  const authInfo = useUserInfoStore(state => state.getAuthInfo());
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);

  const [countryCode, setCountryCode] = useState<CountryCallingCode>(
    (authInfo?.authType === 'phone' ? authInfo.auth.countryCode : '+1') as CountryCallingCode,
  );
  const [identifier, setIdentifier] = useState(
    (() => {
      if (!authInfo || ['telegramUserId', 'farcasterUsername'].includes(authInfo.authType)) {
        return '';
      }
      if (authInfo.authType !== 'phone') {
        return authInfo.identifier;
      }

      return authInfo.auth.phone;
    })(),
  );
  const [identifierType, setIdentifierType] = useState<Extract<AuthType, 'email' | 'phone'> | undefined>(
    authInfo && (authInfo.authType === 'email' || authInfo.authType === 'phone') ? authInfo.authType : undefined,
  );

  const [matchedCountryCode, setMatchedCountryCode] = useState<DropdownInputEventDetail>(DEFAULT_COUNTRY);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const isEmail = identifierType === 'email';
  const isPhone = identifierType === 'phone';
  const isUnknown = !identifierType;

  const filteredCountryCodes = search
    ? countryCodes.filter(
        cc =>
          cc.selectedLabel.toLowerCase().includes(search.toLowerCase()) ||
          cc.label.toLowerCase().includes(search.toLowerCase()) ||
          cc.value.toLowerCase().includes(search.toLowerCase()),
      )
    : countryCodes;

  const handleSearchInput = (ev: CpslSelectCustomEvent<string>) => {
    setSearch(ev.detail);
  };

  const handleIdentifierInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    const newIdentifier = ev.detail.value;
    let isNewPhone = false,
      isNewEmail = false;

    if (!disablePhoneLogin) {
      const countryCodeInputMatch = countryCodes.find(cc => cc.value === newIdentifier);
      if (countryCodeInputMatch) {
        setCountryCode(countryCodeInputMatch.value as CountryCallingCode);
        setMatchedCountryCode(countryCodeInputMatch);
        setIdentifierType('phone');

        setIdentifier('');
        return;
      }

      isNewPhone = !isEmail && isPhone ? /\d+$/.test(newIdentifier) : /\d\d\d+$/.test(newIdentifier);
    }

    if (!disableEmailLogin) {
      isNewEmail = /\D.*$/.test(newIdentifier);
    }

    setIdentifierType(isNewEmail ? 'email' : isNewPhone ? 'phone' : undefined);
    setIdentifier(newIdentifier);
  };

  const handleCountryCodeInput = (ev: CpslSelectCustomEvent<string>) => {
    const matchedCountryCode = countryCodes.find(code => code.selectedLabel === ev.detail);
    setCountryCode(matchedCountryCode.value as CountryCallingCode);
    setMatchedCountryCode(matchedCountryCode);
  };

  const login = async () => {
    setError('');
    if (isUnknown) {
      setError('Please enter a valid email or phone number!');
      return;
    }

    let auth;

    if (isEmail) {
      if (!EMAIL_REGEX.test(identifier)) {
        setError('Please enter a valid email!');
        return;
      }

      // Logout to ensure cleared Capsule state but preserve pregen wallets
      // TODO: migrate to hook once we force the use of the CapsuleProvider
      await para.logout();

      auth = { email: identifier };

      setAuthInfo(auth);
      const userExists = await para.checkIfUserExists({ email: identifier });
      if (userExists) {
        const supportedAuthMethods = await para.initiateUserLoginV2(auth);
        const biometricLocationHints = supportedAuthMethods.has(AuthMethod.PASSKEY)
          ? await para.getUserBiometricLocationHints()
          : [];

        setFlow('login');
        setStep(ModalStep.BIOMETRIC_LOGIN);
        setSupportedAuthMethods(supportedAuthMethods);
        setBiometricLocationHints(biometricLocationHints);
        return;
      }

      // TODO: migrate to hook once we force the use of the CapsuleProvider
      await para.createUser(auth);
      setFlow('signUp');
      setStep(ModalStep.VERIFICATIONS);
      return;
    }
    if (isPhone) {
      // Logout to ensure cleared Capsule state but preserve pregen wallets
      // TODO: migrate to hook once we force the use of the CapsuleProvider
      await para.logout();

      let userExists = false;

      try {
        userExists = await para.checkIfUserExistsByPhone({ phone: identifier, countryCode });
      } catch (error) {
        setError('Please enter a valid phone number!');
        return;
      }

      auth = { phone: identifier, countryCode };

      setAuthInfo(auth);

      if (userExists) {
        // TODO: migrate to hook once we force the use of the CapsuleProvider
        const supportedAuthMethods = await para.initiateUserLoginV2(auth);
        const biometricLocationHints = supportedAuthMethods.has(AuthMethod.PASSKEY)
          ? await para.getUserBiometricLocationHints()
          : [];

        setFlow('login');
        setStep(ModalStep.BIOMETRIC_LOGIN);
        setSupportedAuthMethods(supportedAuthMethods);
        setBiometricLocationHints(biometricLocationHints);
        return;
      }

      // TODO: migrate to hook once we force the use of the CapsuleProvider
      await para.createUserByPhone(auth);
      setFlow('signUp');
      setStep(ModalStep.VERIFICATIONS);
      return;
    }
  };

  const handleSubmit = async () => {
    setIsLoggingIn(true);
    await login();
    setIsLoggingIn(false);
  };

  if (disableEmailLogin && disablePhoneLogin) {
    return null;
  }

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        await handleSubmit();
      }}
    >
      <StyledInput
        ref={inputRef}
        id="authInput"
        key={'email'}
        placeholder={
          isEmail || disablePhoneLogin
            ? 'Enter email'
            : isPhone || disableEmailLogin
              ? 'Enter phone'
              : 'Enter email or phone'
        }
        onCpslInput={handleIdentifierInput}
        value={identifier}
        errorText={error}
        autofocus
        inputMode="email"
        onKeyDown={async e => e.key === 'Enter' && handleSubmit()}
        contrastText
        isPhone={isPhone}
        mask={identifierType === 'phone' ? (phoneMasks[matchedCountryCode.selectedLabel] ?? defaultPhoneMask) : undefined}
        enterkeyhint="go"
        noAutoDisable
        disabled={isLoggingIn}
        data-testid="auth-input"
      >
        <IconContainer slot="start">
          {!disableEmailLogin && (isUnknown || isEmail) && <CpslIcon aria-label="email" icon="mail" />}
          {!disablePhoneLogin && isUnknown && <CpslIcon aria-label="phone" icon="phone" />}
          {isPhone && (
            <CountryCodeSelect
              selectedValue={matchedCountryCode.selectedLabel}
              onCpslSelectValueChange={handleCountryCodeInput}
              showFormattedSelectedItem
              autoWidth
              dropdownMaxHeight={dropdownMaxHeight}
              anchorElId="authInput"
              $width={dropdownWidth}
              showSearch
              searchPlaceholder="Search Countries"
              onCpslSearchChange={handleSearchInput}
              data-testid="country-code-select"
            >
              {matchedCountryCode && (
                <SelectedItem slot="selected-item">
                  <CpslText>{matchedCountryCode.selectedLabel}</CpslText>
                  <CpslText>{matchedCountryCode.value}</CpslText>
                </SelectedItem>
              )}
              {filteredCountryCodes.map(cc => (
                <StyledSelectItem key={cc.selectedLabel} slot="items" value={cc.selectedLabel}>
                  <CpslText>{cc.label}</CpslText>
                  <CpslText>{cc.value}</CpslText>
                </StyledSelectItem>
              ))}
            </CountryCodeSelect>
          )}
        </IconContainer>
        {identifier && (
          <CpslButton slot="end" size="small" fullWidth disabled={isLoggingIn} onClick={handleSubmit}>
            {isLoggingIn ? <CpslSpinner size={16} /> : <CpslIcon icon="arrowNarrow" />}
          </CpslButton>
        )}
      </StyledInput>
    </form>
  );
};

const IconContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
  border-right: 1px solid var(--cpsl-color-background-16);

  & cpsl-icon {
    --icon-color: var(--cpsl-color-contrast);
  }
`;

const CountryCodeSelect = styled(CpslSelect)<{ $width: number }>`
  --container-height: 100%;
  --container-padding-start: 0px;
  --container-padding-end: 0px;
  --container-border-width: 0px;
  --container-gap: 4px;
  --container-background-color: transparent;
  --container-box-shadow: none;

  &::part(dropdown) {
    width: ${({ $width }) => `${$width - 2}px`};
  }

  &::part(popover) {
    @media (max-width: ${MOBILE_SIZE}px) {
      top: unset !important;
      bottom: 16px;
    }

    cpsl-auth-modal.force-mobile-media & {
      top: unset !important;
      bottom: 16px;
    }
  }
`;

const StyledSelectItem = styled(CpslSelectItem)`
  &::part(inner-container) {
    justify-content: space-between;
  }
`;

const SelectedItem = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledInput = styled(CpslInput)`
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: var(--cpsl-color-background-8);
  --container-padding-end: 8px;
`;
