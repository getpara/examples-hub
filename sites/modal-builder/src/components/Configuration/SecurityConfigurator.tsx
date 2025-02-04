import React, { useCallback } from 'react';
import styled from 'styled-components';
import { AccordionContent, AccordionItem, AccordionTrigger, Button, SegmentControl, SwitchItem, Text } from '../UI';
import { useAtom } from 'jotai';
import { securityConfigAtom } from '../../atoms';
import { CpslIcon } from '@getpara/react-components';
import { SegmentItem } from '../../types';

const DEVELOPER_PORTAL_URL = 'https://developer.getpara.com';
const DEVELOPER_PORTAL_LABEL = 'Configure In Developer Portal';
const SECTION_LABEL = 'Security';
const SECTION_SECONDARY_TEXT = 'Control how your users protect their account.';
const CONTAINER_BACKGROUND = '#f0f0f0';

const TWO_FACTOR_SEGMENT_ITEMS: SegmentItem[] = [
  { icon: 'asterisk', label: 'Optional', value: 'optional' },
  { icon: 'checkSquare', label: 'Required', value: 'required' },
];

interface SecurityConfiguratorProps {}

export const SecurityConfigurator: React.FC<SecurityConfiguratorProps> = () => {
  const [securityConfig, setSecurityConfig] = useAtom(securityConfigAtom);

  const toggleTwoFactorAuth = useCallback(
    (checked: boolean) => {
      setSecurityConfig({
        ...securityConfig,
        twoFactorAuthEnabled: checked,
      });
    },
    [securityConfig],
  );

  const toggleRecoverySecret = useCallback(
    (checked: boolean) => {
      setSecurityConfig({
        ...securityConfig,
        recoverySecretStepEnabled: checked,
      });
    },
    [securityConfig],
  );

  const handleOpenDeveloperPortal = useCallback(() => {
    window.open(DEVELOPER_PORTAL_URL, '_blank');
  }, []);

  return (
    <AccordionItem value="security">
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Container>
            <SwitchItem
              label="2FA"
              isChecked={securityConfig.twoFactorAuthEnabled!}
              onToggle={toggleTwoFactorAuth}
              disableBackground
              disablePadding
              disableRadius
            />
            <Text variant="bodyXS" color="secondary" weight="medium">
              Prompt User to set up 2FA for their wallet.
            </Text>
            <SegmentControl items={TWO_FACTOR_SEGMENT_ITEMS} onSelect={() => {}} defaultSelectedIndex={0} />
          </Container>
          <Container>
            <SwitchItem
              label="Recovery"
              isChecked={securityConfig.recoverySecretStepEnabled!}
              onToggle={toggleRecoverySecret}
              disableBackground
              disablePadding
              disableRadius
            />
            <Text variant="bodyXS" color="secondary" weight="medium">
              Prompt User to save Recovery Secret (vs obtaining it later).
            </Text>
          </Container>
          <ActionButton variant="secondary" onClick={handleOpenDeveloperPortal} size="small">
            <ButtonContent>
              <Text variant="bodyS" weight="medium" color="primary">
                {DEVELOPER_PORTAL_LABEL}
              </Text>
              <ButtonIcon icon="linkExternal" />
            </ButtonContent>
          </ActionButton>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const Container = styled.div`
  background: ${CONTAINER_BACKGROUND};
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActionButton = styled(Button)``;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #000000;
`;
