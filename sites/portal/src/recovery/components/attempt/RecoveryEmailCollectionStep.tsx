import { VStack, Spacer, HStack, Text, Box } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import EmailContext from '../../contexts/EmailContext';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';
import Plus from '../../../assets/plus';
import WalletCreation from '../../../assets/walletCreation';
import PhoneContext from '../../contexts/PhoneContext';
import { CpslButton, CpslDropdown, CpslIcon, CpslInput } from '@usecapsule/react-components';
import parsePhoneNumberFromString, { CountryCallingCode } from 'libphonenumber-js';
import {
  CpslInputCustomEvent,
  DropdownInputEventDetail,
  IconType,
  InputInputEventDetail,
  CpslDropdownCustomEvent,
} from '@usecapsule/core-components';
import countryCodes from './countryCodes';
import { useCapsule } from '../../../components/CapsuleContext';

const DEFAULT_COUNTRY = { label: 'United States', value: '+1', selectedLabel: 'US', icon: 'US' as IconType };

const RecoveryEmailCollectionStep: React.FC = () => {
  const capsule = useCapsule();
  const { setCurrentStep } = useContext(StepContext);
  const { setEmail } = useContext(EmailContext);
  const { setPhone, setCountryCode } = useContext(PhoneContext);
  const [inputEmail, setInputEmail] = useState(null);
  const [inputPhone, setInputPhone] = useState(null);
  const [inputCountryCode, setInputCountryCode] = useState<CountryCallingCode>('+1' as CountryCallingCode);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [matchedCountryCode, setMatchedCountryCode] = useState<DropdownInputEventDetail>(DEFAULT_COUNTRY);

  const checkAndSetPhoneNumberFromStringDidChange = (inputPhone: string): boolean => {
    const phoneNumber = parsePhoneNumberFromString(inputPhone);

    if (phoneNumber) {
      const countryCode = phoneNumber.country;
      const nationalNumber = phoneNumber.formatNational();

      const matchedCountryCode = countryCodes.find(code => code.selectedLabel === countryCode);

      if (matchedCountryCode) {
        setCountryCode(matchedCountryCode.value as CountryCallingCode);
        setInputCountryCode(matchedCountryCode.value as CountryCallingCode);
        setPhone(nationalNumber);
        setInputPhone(nationalNumber);
        setMatchedCountryCode(matchedCountryCode);
        return true;
      }
    }

    return false;
  };

  const handleCountryCodeInput = (ev: CpslDropdownCustomEvent<DropdownInputEventDetail>) => {
    const matchedCountryCode = countryCodes.find(code => code.selectedLabel === ev.detail.selectedLabel);
    setInputCountryCode(ev.detail.value as CountryCallingCode);
    setMatchedCountryCode(matchedCountryCode);
  };

  const handlePasteInput = (ev: CpslInputCustomEvent<ClipboardEvent>) => {
    const clipboardEvent = ev.detail;
    const paste = clipboardEvent.clipboardData?.getData('text');

    if (paste) {
      checkAndSetPhoneNumberFromStringDidChange(paste);
    }
  };

  const handlePhoneInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPhoneError('');
    if (!checkAndSetPhoneNumberFromStringDidChange(ev.detail.value)) {
      setInputPhone(ev.detail.value);
    }
  };

  return (
    <VStack alignItems="center" display="flex" flex={1}>
      <WalletCreation />
      <Text textColor="brand.text" fontSize="ml">
        Initiate recovery
      </Text>
      <Text textColor="brand.text" fontSize="ml" textAlign="center">
        First, enter your email or phone number
      </Text>
      <Spacer />
      <HStack alignItems="start">
        <Box marginTop="6px">
          <Plus />
        </Box>
        <Box>
          <Text textColor="brand.content" fontSize="m">
            Enter email or phone number
          </Text>
          <Text textColor="brand.content" fontSize="s">
            We'll need this to know what account you're initiating recovery for
          </Text>
        </Box>
      </HStack>

      <Spacer />
      <HStack style={{ width: '300px', overflow: 'hidden' }}>
        <CpslInput
          placeholder="Enter your email"
          onCpslInput={async e => {
            const em = e.target.value;
            setInputEmail(em);
          }}
          value={inputEmail}
          errorText={emailError}
          autofocus
          inputMode="email"
          style={{ width: '100%' }}
        >
          <CpslIcon slot="start" icon="mail" />
          <CpslButton
            slot="end"
            onClick={async () => {
              if (!inputEmail) {
                throw new Error('Email is required');
              }
              capsule.clearStorage();

              const userExists = await capsule.checkIfUserExists(inputEmail);
              if (userExists) {
                setEmail(inputEmail);
                setCurrentStep(ModalStep.VERIFICATION_CODE);
                await capsule.ctx.capsuleClient.initializeRecovery(inputEmail);
              } else {
                setEmailError('This user does not exist with Capsule');
              }
            }}
          >
            <CpslIcon icon="arrow" />
          </CpslButton>
        </CpslInput>
      </HStack>
      <HStack style={{ width: '300px', overflow: 'hidden' }}>
        <CpslInput
          placeholder="Enter phone number"
          inputMode="tel"
          autofocus
          value={inputPhone}
          errorText={phoneError}
          onCpslInput={handlePhoneInput}
          onCpslPaste={handlePasteInput}
          style={{ width: '100%' }}
        >
          <CpslDropdown
            hasCpslSearch={true}
            selectedItem={matchedCountryCode}
            onSelectedItemChange={handleCountryCodeInput}
            slot="start"
            items={countryCodes}
            style={{ maxWidth: '50px' }}
          />
          <CpslButton
            slot="end"
            onClick={async () => {
              if (!inputPhone || !inputCountryCode) {
                throw new Error('Country code and phone number are required');
              }

              capsule.clearStorage();

              const userExists = await capsule.checkIfUserExistsByPhone(inputPhone, inputCountryCode);
              if (userExists) {
                setPhone(inputPhone);
                setCountryCode(inputCountryCode);
                setCurrentStep(ModalStep.VERIFICATION_CODE_PHONE);
                await capsule.ctx.capsuleClient.initializeRecoveryForPhone(inputPhone, inputCountryCode);
              } else {
                setPhoneError('This user does not exist with Capsule');
              }
            }}
          >
            <CpslIcon icon="arrow" />
          </CpslButton>
        </CpslInput>
      </HStack>
      <Box flex={1} height="40px" />
    </VStack>
  );
};

export default RecoveryEmailCollectionStep;
