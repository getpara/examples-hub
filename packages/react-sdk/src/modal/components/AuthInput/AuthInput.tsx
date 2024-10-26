import {
  CpslInputCustomEvent,
  CpslSelectCustomEvent,
  DropdownInputEventDetail,
  IconType,
  InputInputEventDetail,
} from '@usecapsule/core-components';
import {
  CpslButton,
  CpslIcon,
  CpslInput,
  CpslSelect,
  CpslSelectItem,
  CpslSpinner,
  CpslText,
} from '@usecapsule/react-components';
import { CountryCallingCode } from 'libphonenumber-js';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import countryCodes from './countryCodes.js';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { EMAIL_REGEX, MOBILE_SIZE } from '../../constants/constants.js';
import { useDropdownPosition } from './hooks/useDropdownPosition.js';
import { ModalStep } from '../../utils/steps.js';
import { defaultPhoneMask, phoneMasks } from './phoneMasks.js';

interface AuthInputProps {
  disableEmailLogin?: boolean;
  disablePhoneLogin?: boolean;
}

const DEFAULT_COUNTRY = { label: 'United States', value: '+1', selectedLabel: 'US', icon: 'US' as IconType };

export const AuthInput = ({ disableEmailLogin, disablePhoneLogin }: AuthInputProps) => {
  const inputRef = useRef<HTMLCpslInputElement>(null);
  const { dropdownMaxHeight, dropdownWidth } = useDropdownPosition(inputRef);

  const capsule = useCapsuleStore(state => state.capsule);
  const setCountryCode = useUserInfoStore(state => state.setCountryCode);
  const setIdentifier = useUserInfoStore(state => state.setIdentifier);
  const identifier = useUserInfoStore(state => state.identifier);
  const identifierType = useUserInfoStore(state => state.identifierType);
  const countryCode = useUserInfoStore(state => state.countryCode);
  const setIdentifierType = useUserInfoStore(state => state.setIdentifierType);
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);

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

    if (isEmail) {
      if (!EMAIL_REGEX.test(identifier)) {
        setError('Please enter a valid email!');
        return;
      }

      // Logout to ensure cleared Capsule state but preserve pregen wallets
      await capsule.logout(true);

      const userExists = await capsule.checkIfUserExists(identifier);
      if (userExists) {
        const webAuthUrlForLogin = await capsule.initiateUserLogin(identifier);
        const biometricLocationHints = await capsule.getUserBiometricLocationHints();
        setFlow('login');
        setStep(ModalStep.BIOMETRIC_LOGIN);
        setWebAuthURLForLogin(webAuthUrlForLogin);
        setBiometricLocationHints(biometricLocationHints);
        return;
      }

      await capsule.createUser(identifier);
      setFlow('signUp');
      setStep(ModalStep.VERIFICATIONS);
      return;
    }
    if (isPhone) {
      // Logout to ensure cleared Capsule state but preserve pregen wallets
      await capsule.logout(true);

      let userExists = false;

      try {
        userExists = await capsule.checkIfUserExistsByPhone(identifier, countryCode);
      } catch (error) {
        setError('Please enter a valid phone number!');
        return;
      }

      if (userExists) {
        const webAuthUrlForLogin = await capsule.initiateUserLoginForPhone(identifier, countryCode);
        const biometricLocationHints = await capsule.getUserBiometricLocationHints();
        setFlow('login');
        setStep(ModalStep.BIOMETRIC_LOGIN);
        setWebAuthURLForLogin(webAuthUrlForLogin);
        setBiometricLocationHints(biometricLocationHints);
        return;
      }

      await capsule.createUserByPhone(identifier, countryCode);
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
        mask={identifierType === 'phone' ? (phoneMasks[matchedCountryCode.selectedLabel] ?? defaultPhoneMask) : undefined}
        enterkeyhint="go"
        noAutoDisable
        disabled={isLoggingIn}
      >
        <IconContainer slot="start">
          {!disableEmailLogin && (isUnknown || isEmail) && <CpslIcon icon="mail" />}
          {!disablePhoneLogin && isUnknown && <CpslIcon icon="phone" />}
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
