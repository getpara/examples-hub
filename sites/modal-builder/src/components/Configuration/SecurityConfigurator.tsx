import React from 'react';
import styled from 'styled-components';
import { AccordionContent, AccordionItem, AccordionTrigger, Button, SegmentControl, SwitchItem, Text } from '../UI';
import { useAtom } from 'jotai';
import { securityConfigAtom } from '../../atoms';
import { CpslIcon } from '@usecapsule/react-components';

interface SecurityConfiguratorProps {}

export const SecurityConfigurator: React.FC<SecurityConfiguratorProps> = () => {
  const [securityConfig, setSecurityConfig] = useAtom(securityConfigAtom);

  const toggleTwoFactorAuth = (checked: boolean) => {
    setSecurityConfig({
      ...securityConfig,
      twoFactorAuthEnabled: checked,
    });
  };

  const toggleRecoverySecret = (checked: boolean) => {
    setSecurityConfig({
      ...securityConfig,
      recoverySecretStepEnabled: checked,
    });
  };

  return (
    <AccordionItem value="security">
      <AccordionTrigger label="Security" secondaryText="Control how your users protect their account." />
      <AccordionContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* <div>
            <MarginBottom>
              <SegmentControl
                items={[
                  { icon: 'key', label: 'Passkey', value: 'passkey' },
                  { icon: 'passcode', label: 'Password', value: 'password' },
                  { icon: 'stopSquare', label: 'Both', value: 'both' },
                ]}
                onSelect={() => {}}
                defaultSelectedIndex={0}
                fullWidth
              />
            </MarginBottom>

            <Text variant="bodyXS" color="secondary" weight="medium">
              Extra information about this selection can go here.
            </Text>
          </div> */}
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
            <SegmentControl
              items={[
                { icon: 'asterisk', label: 'Optional', value: 'optional' },
                { icon: 'checkSquare', label: 'Required', value: 'required' },
              ]}
              onSelect={() => {}}
              defaultSelectedIndex={0}
            />
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
          <ActionButton
            variant="secondary"
            onClick={() => window.open('https://developer.usecapsule.com', '_blank')}
            size="small"
          >
            <ButtonContent>
              <Text variant="bodyS" weight="medium" color="primary">
                Configure In Developer Portal
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
  background: #f0f0f0;
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
