import React from 'react';
import styled from 'styled-components';
import { BorderRadius } from '@usecapsule/react-components';

import { BORDER_RADIUS_OPTIONS, FONT_OPTIONS } from '../../constants';
import { DropdownOption } from '../../types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ColorInputPicker,
  CustomizationLink,
  DropdownSelector,
  Text,
} from '../UI/';
import { useAtom } from 'jotai';
import { appearanceConfigAtom } from '../../atoms';

const SECTION_LABEL = 'Appearance';
const SECTION_SECONDARY_TEXT = 'Control the look and feel of your modal integration';
const LOGO_MAX_SIZE_TEXT = 'Max size: 372px X 160px';
const LOGO_PLACEHOLDER = 'www.yourwebsite.com';

const COLOR_INPUTS = [
  {
    name: 'foreground',
    label: 'Foreground Color',
    getColor: (config: any) => config.theme?.foregroundColor,
  },
  {
    name: 'background',
    label: 'Background Color',
    getColor: (config: any) => config.theme?.backgroundColor,
  },
  {
    name: 'accent',
    label: 'Accent Color (Optional)',
    getColor: (config: any) => config.theme?.accentColor,
  },
];

interface AppearanceConfiguratorProps {}

export const AppearanceConfigurator: React.FC<AppearanceConfiguratorProps> = () => {
  const [appearanceConfig, setAppearanceConfig] = useAtom(appearanceConfigAtom);

  const handleForegroundColorChange = (color: string) => {
    setAppearanceConfig({
      ...appearanceConfig,
      theme: { ...appearanceConfig.theme, foregroundColor: color },
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    setAppearanceConfig({
      ...appearanceConfig,
      theme: { ...appearanceConfig.theme, backgroundColor: color },
    });
  };

  const handleAccentColorChange = (color: string) => {
    setAppearanceConfig({
      ...appearanceConfig,
      theme: { ...appearanceConfig.theme, accentColor: color },
    });
  };

  const handleFontChange = (selectedOption: DropdownOption) => {
    setAppearanceConfig({
      ...appearanceConfig,
      theme: { ...appearanceConfig.theme, font: selectedOption.value as string },
    });
  };

  const handleBorderRadiusChange = (selectedOption: DropdownOption) => {
    setAppearanceConfig({
      ...appearanceConfig,
      theme: { ...appearanceConfig.theme, borderRadius: selectedOption.value as BorderRadius },
    });
  };

  const handleLogoChange = (value: string) => {
    setAppearanceConfig({
      ...appearanceConfig,
      logo: value,
    });
  };

  return (
    <AccordionItem value="appearance">
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <StyledContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Text variant="bodyS" weight="medium" color="primary">
              Logo URL
            </Text>
            <InputContainer>
              <Input
                id="logo"
                name="logo"
                type="text"
                value={appearanceConfig.logo || ''}
                placeholder={LOGO_PLACEHOLDER}
                className="mb-2"
                onChange={e => handleLogoChange(e.currentTarget.value)}
                onInput={e => handleLogoChange(e.currentTarget.value)}
                onPaste={e => handleLogoChange(e.currentTarget.value)}
              />
            </InputContainer>
            <Text variant="bodyXS" color="secondary" weight="medium">
              {LOGO_MAX_SIZE_TEXT}
            </Text>
          </div>
          {COLOR_INPUTS.map((input, index) => (
            <ColorInputPicker
              key={index}
              onColorChange={
                input.name === 'foreground'
                  ? handleForegroundColorChange
                  : input.name === 'background'
                    ? handleBackgroundColorChange
                    : handleAccentColorChange
              }
              label={input.label}
              color={input.getColor(appearanceConfig)}
              name={input.name}
            />
          ))}
          <DropdownSelector
            label="Font"
            placeholder="Choose a font"
            options={FONT_OPTIONS}
            value={FONT_OPTIONS.find(option => option.value === appearanceConfig.theme?.font)}
            onChange={handleFontChange}
            isFont
          />
          <DropdownSelector
            label="Corner Radius"
            placeholder="Choose a Size"
            options={BORDER_RADIUS_OPTIONS}
            value={BORDER_RADIUS_OPTIONS.find(option => option.value === appearanceConfig.theme?.borderRadius)}
            onChange={handleBorderRadiusChange}
            isFont={false}
          />
          <CustomizationLink />
        </StyledContent>
      </AccordionContent>
    </AccordionItem>
  );
};

const StyledContent = styled.div`
  gap: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex-grow: 1;
  border: none;
  font-size: 1rem;
  line-height: 1.5rem;
  background-color: transparent;
  outline: none;
  ::placeholder {
    color: #616161;
    opacity: 1;
  }
`;
