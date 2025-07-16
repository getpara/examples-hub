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
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { safeStyled } from '@getpara/react-common';
import countryCodes from '../../utils/countryCodes.js';
import { MOBILE_SIZE } from '../../constants/constants.js';
import { useDropdownPosition } from './hooks/useDropdownPosition.js';
import { defaultPhoneMask, phoneMasks } from './phoneMasks.js';
import { Auth, AuthType, extractAuthInfo, PrimaryAuthInfo } from '@getpara/user-management-client';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NationalNumber } from 'libphonenumber-js';
import { isCcMatch, validateInput } from '../../utils/authInputHelpers.js';

type ChildProps = {
  isPending: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
};

type AuthInputProps = {
  defaultAuth?: Auth<'email' | 'phone'>;
  onSubmit: (_: Auth<'email' | 'phone'>) => void;
  isSubmitting: boolean;
  disableEmailLogin?: boolean;
  disablePhoneLogin?: boolean;
  disableSubmitButton?: boolean;
  children?: (_: ChildProps) => ReactNode;
  error?: string | null;
  sticky?: boolean;
};

const DEFAULT_COUNTRY = { label: 'United States', value: '+1', selectedLabel: 'US', icon: 'US' as IconType };

export const AuthInput = ({
  defaultAuth,
  disableEmailLogin,
  disablePhoneLogin,
  onSubmit: _onSubmit,
  isSubmitting,
  disableSubmitButton,
  children: Children,
  error: propsError,
  sticky = false,
}: AuthInputProps) => {
  const inputRef = useRef<HTMLCpslInputElement>(null);
  const { dropdownMaxHeight, dropdownWidth } = useDropdownPosition(inputRef);

  const [authInfo, storedNationalNumber, storedCountryCode] = useMemo<
    [PrimaryAuthInfo | undefined, NationalNumber | undefined, CountryCallingCode | undefined]
  >(() => {
    if (!defaultAuth) {
      return [undefined, undefined, undefined];
    }

    const authInfo = extractAuthInfo(defaultAuth);

    if (!authInfo || authInfo?.authType !== 'phone') {
      return [authInfo, undefined, undefined];
    }

    const parsed = parsePhoneNumberFromString(authInfo.identifier);

    return [authInfo, parsed?.nationalNumber, parsed?.countryCallingCode];
  }, [defaultAuth]);

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
  const [error, setError] = useState<string | undefined>(propsError || undefined);
  const [isPending, setIsPending] = useState(isSubmitting || false);
  const [search, setSearch] = useState('');

  const setCountryCodes = (countyCodeInput: DropdownInputEventDetail) => {
    setCountryCode(countyCodeInput.value as CountryCallingCode);
    setMatchedCountryCode(countyCodeInput);
  };

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
    if (!sticky) {
      setError(undefined);
    }
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
    setError(undefined);

    try {
      const auth = validateInput(identifier, countryCode, identifierType);
      _onSubmit(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setIsPending(isSubmitting);
  }, [isSubmitting]);

  useEffect(() => {
    if (propsError === null || (propsError === undefined && !sticky)) {
      setError(undefined);
    }
    if (propsError) {
      setError(propsError);
      setIsPending(false);
    }
  }, [propsError, sticky]);

  useEffect(() => {
    if (!sticky || isSubmitting) {
      setIsPending(isSubmitting);
    }
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
      style={{ width: '100%' }}
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
        {identifier && !disableSubmitButton && (
          <CpslButton slot="end" size="small" fullWidth disabled={isPending} onClick={onSubmit}>
            {isPending ? <CpslSpinner size={16} /> : <CpslIcon icon="arrowNarrow" />}
          </CpslButton>
        )}
      </StyledInput>
      {Children && (
        <ChildContainer>
          <Children onSubmit={onSubmit} isPending={isPending} isSubmitting={isPending} />
        </ChildContainer>
      )}
    </form>
  );
};

const IconContainer = safeStyled.div`
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

const CountryCodeSelect = safeStyled(CpslSelect)<{ $width: number }>`
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

const StyledSelectItem = safeStyled(CpslSelectItem)`
  &::part(inner-container) {
    justify-content: space-between;
  }
`;

const SelectedItem = safeStyled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledInput = safeStyled(CpslInput)`
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: var(--cpsl-color-background-8);
  --container-padding-end: 8px;
  width: 100%;
`;

const ChildContainer = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  width: 100%;
`;
