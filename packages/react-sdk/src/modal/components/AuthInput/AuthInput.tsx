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
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import countryCodes from '../../utils/countryCodes.js';
import { MOBILE_SIZE } from '../../constants/constants.js';
import { useDropdownPosition } from './hooks/useDropdownPosition.js';
import { defaultPhoneMask, phoneMasks } from './phoneMasks.js';
import { Auth, AuthType } from '@getpara/user-management-client';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NationalNumber } from 'libphonenumber-js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { isCcMatch, validateAuth } from '../../utils/authInputHelpers.js';

interface AuthInputProps {
  disableEmailLogin?: boolean;
  disablePhoneLogin?: boolean;
}

const DEFAULT_COUNTRY = { label: 'United States', value: '+1', selectedLabel: 'US', icon: 'US' as IconType };

export const AuthInput = ({ disableEmailLogin, disablePhoneLogin }: AuthInputProps) => {
  const inputRef = useRef<HTMLCpslInputElement>(null);
  const { dropdownMaxHeight, dropdownWidth } = useDropdownPosition(inputRef);
  const defaultAuthIdentifier = useStore(state => state.modalConfig?.defaultAuthIdentifier);

  const para = useInternalClient();
  const { signUpOrLogIn, isSignUpOrLogInPending } = useAuthActions();
  const authInfo = para.authInfo;

  const [storedNationalNumber, storedCountryCode] = useMemo<
    [NationalNumber | undefined, CountryCallingCode | undefined]
  >(() => {
    if (authInfo?.authType !== 'phone') {
      return [undefined, undefined];
    }

    const parsed = parsePhoneNumberFromString(authInfo.identifier);

    return [parsed?.nationalNumber, parsed?.countryCallingCode];
  }, [authInfo?.authType, authInfo?.identifier]);

  const [countryCode, setCountryCode] = useState<CountryCallingCode>((storedCountryCode ?? '+1') as CountryCallingCode);
  const [identifier, setIdentifier] = useState(
    (() => {
      if (!authInfo?.authType || ['telegram', 'farcaster', 'externalWallet'].includes(authInfo?.authType)) {
        return '';
      }
      if (authInfo.authType !== 'phone') {
        return authInfo.identifier;
      }

      return storedNationalNumber ?? '';
    })(),
  );
  const [identifierType, setIdentifierType] = useState<Extract<AuthType, 'email' | 'phone'> | undefined>(
    authInfo && (authInfo.authType === 'email' || authInfo.authType === 'phone') ? authInfo.authType : undefined,
  );

  const [matchedCountryCode, setMatchedCountryCode] = useState<DropdownInputEventDetail>(
    countryCodes.find(option => isCcMatch(countryCode, option)) ?? DEFAULT_COUNTRY,
  );
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(isSignUpOrLogInPending);
  const [search, setSearch] = useState('');

  const setCountryCodes = (countyCodeInput: DropdownInputEventDetail) => {
    setCountryCode(countyCodeInput.value as CountryCallingCode);
    setMatchedCountryCode(countyCodeInput);
  };

  useEffect(() => {
    // Only set input to the default if authInfo hasn't been set yet, else use what the user has set.
    if (defaultAuthIdentifier && !authInfo) {
      const number = parsePhoneNumberFromString(defaultAuthIdentifier);

      if (number) {
        const countryCode = `+${number.countryCallingCode}`;
        const countryCodeInputMatch = countryCodes.find(option => isCcMatch(countryCode, option));

        if (countryCodeInputMatch) {
          setCountryCodes(countryCodeInputMatch);
        }
      }

      handleIdentifierInput({
        detail: { value: number ? number.nationalNumber : defaultAuthIdentifier },
      } as CpslInputCustomEvent<InputInputEventDetail>);
    }
  }, [authInfo]);

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
    const newIdentifier = ev.detail.value ?? '';
    let isNewPhone = false,
      isNewEmail = false;

    if (!disablePhoneLogin) {
      const countryCodeInputMatch = countryCodes.find(option => isCcMatch(newIdentifier, option));
      if (countryCodeInputMatch) {
        setCountryCodes(countryCodeInputMatch);
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
    if (matchedCountryCode) {
      setCountryCodes(matchedCountryCode);
    }
  };

  const onSubmit = async () => {
    setError('');

    let auth: Auth<'email'> | Auth<'phone'>;

    try {
      auth = validateAuth(identifier, countryCode, identifierType);
      signUpOrLogIn(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isSignUpOrLogInPending) {
      setIsPending(true);
    }
  }, [isSignUpOrLogInPending]);

  useEffect(() => {
    setIsPending(false);
  }, [error]);

  if (disableEmailLogin && disablePhoneLogin) {
    return null;
  }

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        onSubmit();
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
        onKeyDown={async e => e.key === 'Enter' && onSubmit()}
        contrastText
        isPhone={isPhone}
        mask={
          identifierType === 'phone' ? (phoneMasks[matchedCountryCode.selectedLabel ?? ''] ?? defaultPhoneMask) : undefined
        }
        enterkeyhint="go"
        noAutoDisable
        disabled={isPending}
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
              $width={dropdownWidth ?? 0}
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
          <CpslButton slot="end" size="small" fullWidth disabled={isPending} onClick={onSubmit}>
            {isPending ? <CpslSpinner size={16} /> : <CpslIcon icon="arrowNarrow" />}
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
