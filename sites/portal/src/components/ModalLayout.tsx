import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { Partner } from '../types';
import { DEFAULT_HOMEPAGE_URL, DEFAULT_PARTNER } from '../constants';
import { validateColorInput } from '../utils/validateColorInput';
import { BorderRadius, generateTheme } from '@usecapsule/react-components';
import { BetaBannerNoChakra } from './BetaBannerNoChakra';
import { Theme } from '@usecapsule/web-sdk';
import { useCapsule } from './CapsuleContext';

const DEFAULT_THEME = {
  foregroundColor: '#000',
  backgroundColor: '#FFF',
};

export const ModalLayout = () => {
  const capsule = useCapsule();
  const [searchParams] = useSearchParams();
  const paramsPartnerId = searchParams.get('partnerId');
  // TODO: Move this to the partner config
  const homepageUrl = searchParams.get('homepageUrl') ?? DEFAULT_HOMEPAGE_URL;

  // TODO: should we move this to the partner object and use the theme builder or keep for now to allow for overrides but deprecate?
  // THEMING
  const portalForegroundColor = validateColorInput(searchParams.get('portalForegroundColor'))
    ? searchParams.get('portalForegroundColor')
    : '';
  const portalBackgroundColor = validateColorInput(searchParams.get('portalBackgroundColor'))
    ? searchParams.get('portalBackgroundColor')
    : '';
  const portalAccentColor = searchParams.get('portalAccentColor')
    ? validateColorInput(searchParams.get('portalAccentColor'))
      ? searchParams.get('portalAccentColor')
      : undefined
    : undefined;
  const portalPrimaryButtonColor = validateColorInput(searchParams.get('portalPrimaryButtonColor'))
    ? decodeURIComponent(searchParams.get('portalPrimaryButtonColor'))
    : '';
  const portalTextColor = validateColorInput(searchParams.get('portalTextColor'))
    ? decodeURIComponent(searchParams.get('portalTextColor'))
    : '';
  const portalPrimaryButtonTextColor = validateColorInput(searchParams.get('portalPrimaryButtonTextColor'))
    ? decodeURIComponent(searchParams.get('portalPrimaryButtonTextColor'))
    : '';
  const portalBorderRadius = searchParams.get('portalPrimaryButtonTextColor');
  const portalFont = searchParams.get('portalFont');
  const portalThemeMode = searchParams.get('portalThemeMode');

  const [partner, setPartner] = useState<Partner | undefined>();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isBranded, setIsBranded] = useState(true);
  const [, setTheme] = useState<Theme | undefined>({
    foregroundColor: portalForegroundColor ?? DEFAULT_THEME.foregroundColor,
    backgroundColor: portalBackgroundColor ?? DEFAULT_THEME.backgroundColor,
  });

  const toggleBranding = (newValue?: boolean) => {
    setIsBranded(prev => newValue ?? !prev);
  };

  useEffect(() => {
    const isLegacy = portalBackgroundColor && !portalForegroundColor;

    capsule.portalBackgroundColor = portalBackgroundColor;
    capsule.portalPrimaryButtonColor = portalPrimaryButtonColor;
    capsule.portalTextColor = portalTextColor;
    capsule.portalTheme = {
      backgroundColor: portalBackgroundColor,
      foregroundColor: portalForegroundColor,
      borderRadius: portalBorderRadius as unknown as any,
    };

    const newTheme = {
      borderRadius: portalBorderRadius as BorderRadius,
      ...(isBranded
        ? {
            foregroundColor: portalForegroundColor ?? DEFAULT_THEME.foregroundColor,
            backgroundColor: portalBackgroundColor ?? DEFAULT_THEME.backgroundColor,
            mode:
              portalThemeMode === 'dark' || portalThemeMode === 'light' ? (portalThemeMode as 'light' | 'dark') : undefined,
            accentColor: portalAccentColor,
          }
        : {
            foregroundColor: DEFAULT_THEME.foregroundColor,
            backgroundColor: DEFAULT_THEME.backgroundColor,
          }),
    };

    setTheme(newTheme as unknown as any);

    generateTheme({
      font: portalFont,
      ...(isLegacy
        ? {
            ...newTheme,
            customPalette: {
              text: {
                primary: portalTextColor,
                secondary: portalTextColor,
                inverted: portalPrimaryButtonTextColor,
              },
            },
          }
        : newTheme),
    });
    setIsDark(portalThemeMode === 'dark');
  }, [
    isBranded,
    portalForegroundColor,
    portalBackgroundColor,
    portalBorderRadius,
    portalPrimaryButtonColor,
    portalPrimaryButtonTextColor,
    portalTextColor,
    portalFont,
    portalThemeMode,
    portalAccentColor,
  ]);

  useEffect(() => {
    async function getPartner() {
      if (paramsPartnerId) {
        const detailsRes = (await capsule.ctx.capsuleClient.getPartner(paramsPartnerId)).data;
        setPartner(detailsRes.partner);
      } else {
        setPartner(DEFAULT_PARTNER);
      }
    }
    getPartner();
  }, []);

  if (!partner) return null;

  return (
    <>
      <BetaBannerNoChakra />
      <OuterContainer isBranded={isBranded}>
        <Outlet context={{ partner, homepageUrl, isDark, toggleBranding }} />
      </OuterContainer>
    </>
  );
};

const OuterContainer = styled.div<{ isBranded?: boolean }>`
  background-color: ${({ isBranded }) => (isBranded ? 'var(--cpsl-color-modal-surface-footer)' : 'white')};

  height: 100vh;
  width: 100vw;
  width: 100dvw;

  display: flex;
  justify-content: center;
  align-items: center;

  body {
    overflow: hidden;
  }
`;
