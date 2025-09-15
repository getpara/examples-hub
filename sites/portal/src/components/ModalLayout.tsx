import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { DEFAULT_HOMEPAGE_URL, DEFAULT_PARTNER } from '../constants';
import { validateColorInput } from '../utils/validateColorInput';
import { BorderRadius, generateTheme } from '@getpara/react-components';
import { BetaBannerNoChakra } from './BetaBannerNoChakra';
import { PartnerEntity, Theme } from '@getpara/web-sdk';
import { usePara } from './ParaContext';
import { ModalLoading } from './ModalLoading';
import { NetworkSpeedBanner } from '@getpara/react-common';
import { isIFramed } from '../utils/isIFramed';

const DEFAULT_THEME = {
  foregroundColor: '#000',
  backgroundColor: '#FFF',
};

const sendHeightToParent = (height: number) => {
  (window.opener || window.parent)?.postMessage(
    {
      type: 'HEIGHT',
      height,
    },
    '*',
  );
};

export const ModalLayout = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const para = usePara();
  const [searchParams] = useSearchParams();
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

  const [partner, setPartner] = useState<PartnerEntity | undefined>();
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
    if (!partner) return;

    const isLegacy = portalBackgroundColor && !portalForegroundColor;

    const { backgroundColor, foregroundColor, accentColor, themeMode } = partner;

    // If not an iframe and the partner has theming set via dev portal use that, else use the url params
    const _backgroundColor = !isIFramed && backgroundColor ? backgroundColor : portalBackgroundColor;
    const _foregroundColor = !isIFramed && foregroundColor ? foregroundColor : portalForegroundColor;
    const _accentColor = !isIFramed && accentColor ? accentColor : portalAccentColor;
    const _mode = !isIFramed && themeMode ? themeMode : portalThemeMode;

    para.portalBackgroundColor = _backgroundColor;
    para.portalPrimaryButtonColor = portalPrimaryButtonColor;
    para.portalTextColor = portalTextColor;
    para.portalTheme = {
      backgroundColor: _backgroundColor,
      foregroundColor: _foregroundColor,
      borderRadius: portalBorderRadius as unknown as any,
    };

    const newTheme = {
      borderRadius: portalBorderRadius as BorderRadius,
      ...(isBranded
        ? {
            foregroundColor: _foregroundColor ?? DEFAULT_THEME.foregroundColor,
            backgroundColor: _backgroundColor ?? DEFAULT_THEME.backgroundColor,
            mode:
              _mode?.toLowerCase() === 'dark' || _mode?.toLowerCase() === 'light'
                ? (_mode?.toLowerCase() as 'light' | 'dark')
                : undefined,
            accentColor: _accentColor,
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
    setIsDark(_mode?.toLowerCase() === 'dark');
  }, [
    partner,
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
      const { partnerId } = await para.touchSession();
      if (partnerId) {
        const detailsRes = (await para.ctx.client.getPartner(partnerId)).data;
        setPartner(detailsRes.partner);
      } else {
        setPartner(DEFAULT_PARTNER);
      }
    }
    getPartner();

    (window.opener || window.parent)?.postMessage({ type: 'LOADED' }, '*');
  }, []);

  // Add this effect to measure content height
  useEffect(() => {
    if (contentRef.current && partner) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          sendHeightToParent(height);
        }
      });

      observer.observe(contentRef.current);

      // Send initial height
      const initialHeight = contentRef.current.scrollHeight;
      sendHeightToParent(initialHeight);

      return () => {
        observer.disconnect();
      };
    }
  }, [partner]);

  if (!partner) return null;

  return (
    <>
      <BetaBannerNoChakra />
      <NetworkSpeedBanner maxWidth="75%" />
      <OuterContainer isBranded={isBranded}>
        <ContentMeasurer ref={contentRef}>
          <Suspense fallback={<ModalLoading noText />}>
            <Outlet context={{ partner, homepageUrl, isDark, toggleBranding }} />
          </Suspense>
        </ContentMeasurer>
      </OuterContainer>
    </>
  );
};

const ContentMeasurer = styled.div`
  width: 100%;
  height: ${() => (!isIFramed ? '100%' : 'auto')};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OuterContainer = styled.div<{ isBranded?: boolean }>`
  background-color: ${({ isBranded }) =>
    isIFramed ? 'transparent' : isBranded ? 'var(--cpsl-color-modal-surface-footer)' : 'white'};

  height: 100%;
  width: 100vw;
  width: 100dvw;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: ${() => (!isIFramed ? 'auto' : 'hidden')};

  body {
    overflow: hidden;
  }
`;
