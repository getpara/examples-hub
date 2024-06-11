import { CpslSpinner } from '@usecapsule/react-components';
import { CreationStepSubheading, Heading, MainContainer, SpinnerContainer } from '../common.js';
import { OnRampProvider, OnRampPurchaseStatus, getProviderAssetInverse } from '@usecapsule/web-sdk';
import { ON_RAMP_PROVIDERS } from '../../constants/constants.js';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import {
  CryptoElements,
  OnrampElement,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_PUBLISHABLE_KEY_TEST,
} from '../StripeComponents/StripeComponents.js';
import { OnrampSessionResult, loadStripeOnramp } from '@stripe/crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalStep } from '../../utils/steps.js';

const STEPS = {
  CANCELLED: ModalStep.ADD_FUNDS_FAILURE,
  FINISHED: ModalStep.ADD_FUNDS_SUCCESS,
};

export const AddFundsAwaiting = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const capsule = useCapsuleStore((state) => state.capsule);
  const setStep = useModalStore((state) => state.setStep);
  const onRampConfig = useModalStore((state) => state.onRampConfig);
  const onRampPurchase = useModalStore((state) => state.onRampPurchase);

  const setOnRampPurchase = useModalStore((state) => state.setOnRampPurchase);

  const isStripeEmbed = useMemo(() => onRampPurchase.provider === OnRampProvider.STRIPE, [onRampPurchase]);
  const [clientSecret, setClientSecret] = useState(isStripeEmbed ? onRampPurchase?.providerKey : undefined);

  const stripeOnRampPromise = useMemo(
    () => loadStripeOnramp(onRampConfig?.testMode ? STRIPE_PUBLISHABLE_KEY_TEST : STRIPE_PUBLISHABLE_KEY),
    [onRampConfig?.testMode],
  );

  const onSessionChange = useCallback(
    async ({ session }: { session: OnrampSessionResult }) => {
      if (!isStripeEmbed) {
        return;
      }

      switch (session.status) {
        case 'fulfillment_processing':
        case 'fulfillment_complete':
          const updatedPurchase = await capsule.updateOnRampPurchase(onRampPurchase.walletId, onRampPurchase.id, {
            status: OnRampPurchaseStatus.FINISHED,
            fiatQuantity: session.quote.source_amount,
            fiatCurrency: session.quote.source_currency.asset_code,
            asset: getProviderAssetInverse(
              OnRampProvider.STRIPE,
              session.quote.destination_currency.asset_code,
              onRampConfig.testMode,
            ),
            assetQuantity: session.quote.destination_amount,
            providerKey: null,
          });

          setOnRampPurchase(updatedPurchase);
          break;

        default:
          break;
      }
    },
    [isStripeEmbed],
  );

  useEffect(() => {
    if (isStripeEmbed && onRampPurchase?.providerKey) {
      setClientSecret(onRampPurchase.providerKey);
    }
  }, [isStripeEmbed, onRampPurchase?.providerKey]);

  useEffect(() => {
    let timeoutId;

    if (onRampPurchase?.status && ['CANCELLED', 'FINISHED'].includes(onRampPurchase.status)) {
      timeoutId = setTimeout(() => {
        setStep(STEPS[onRampPurchase.status]);
      }, 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [onRampPurchase?.status]);

  return (
    <>
      {!isStripeEmbed && (
        <SpinnerContainer>
          <CpslSpinner />
        </SpinnerContainer>
      )}
      <MainContainer>
        {isStripeEmbed && clientSecret ? (
          <CryptoElements stripeOnramp={stripeOnRampPromise}>
            <OnrampElement
              appearance={isDark ? 'dark' : 'light'}
              clientSecret={clientSecret}
              onSessionChange={onSessionChange}
            />
          </CryptoElements>
        ) : (
          <>
            <Heading>
              <span>Adding Funds...</span>
            </Heading>
            <CreationStepSubheading>
              <span>
                Follow the prompts presented by{' '}
                {onRampPurchase ? ON_RAMP_PROVIDERS[onRampPurchase.provider].name : 'the provider'}.
              </span>
            </CreationStepSubheading>
          </>
        )}
      </MainContainer>
    </>
  );
};
