import { useEffect } from 'react';
import { Branding } from '../types/branding';
import { Theme } from '../types/theme';
import { useThemeStore } from '../stores/theme/useThemeStore';
import { getCssBorderRadii, getCssColors, mergeBranding } from '../utils/theme';
import { darkThemeBranding } from '../constants/darkThemeBranding';

export const useUpdateTheme = ({
  theme,
  branding = {},
  logo,
  logoDark,
  appName,
}: {
  theme?: Theme;
  branding?: Branding;
  logo?: string;
  logoDark?: string;
  appName?: string;
}) => {
  const updateThemeState = useThemeStore((state) => state.updateState);

  useEffect(() => {
    updateThemeState({ logo, logoDark, appName });
  }, [logo, logoDark, appName]);

  useEffect(() => {
    let _branding: Branding = {};

    if (theme) {
      updateThemeState({ theme });

      if (theme === Theme.dark) {
        _branding = darkThemeBranding;
      }
    }

    if (!!Object.keys(_branding).length) {
      mergeBranding(_branding, branding);
    } else {
      _branding = branding;
    }

    if (_branding?.colors) {
      const cssColorVars = getCssColors(_branding);
      Object.entries(cssColorVars).forEach(([k, v]) =>
        document.documentElement.style.setProperty(k, v),
      );
    }

    if (_branding?.borderRadii) {
      const cssBorderRadiiVars = getCssBorderRadii(_branding);
      Object.entries(cssBorderRadiiVars).forEach(([k, v]) =>
        document.documentElement.style.setProperty(k, `${v}px`),
      );
    }

    if (_branding?.font) {
      document.documentElement.style.setProperty(
        '--cpsl-default-font',
        _branding?.font,
      );
    }
  }, [theme, branding]);
};
