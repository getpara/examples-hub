import React, { useCallback } from 'react';
import styled from 'styled-components';
import { AccordionContent, AccordionItem, AccordionTrigger, SwitchItem } from '../UI';
import { authenticationConfigAtom } from '../../atoms';
import { useAtom } from 'jotai';

const SECTION_LABEL = 'Guest Login';
const SECTION_SECONDARY_TEXT =
  'Allow users to proceed in guest mode without signing up, creating embedded wallets. These wallets will be linked to their account if they complete signup at a later time.';

export const GuestLoginConfigurator: React.FC = () => {
  const [authenticationConfig, setAuthenticationConfig] = useAtom(authenticationConfigAtom);

  const onChange = useCallback(
    (isChecked: boolean) => {
      setAuthenticationConfig({ ...authenticationConfig, isGuestModeEnabled: isChecked });
    },
    [authenticationConfig],
  );

  return (
    <AccordionItem value="guest-login">
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <ContentWrapper>
          <SwitchItem
            key="isGuestModeEnabled"
            label="Enable Guest Login"
            isChecked={!!authenticationConfig.isGuestModeEnabled}
            onToggle={onChange}
          />
        </ContentWrapper>
      </AccordionContent>
    </AccordionItem>
  );
};

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
