import React, { useCallback } from 'react';
import styled from 'styled-components';
import { AccordionContent, AccordionItem, AccordionTrigger, SwitchItem } from '../UI';
import { walletsConfigAtom } from '../../atoms';
import { useAtom } from 'jotai';

const SECTION_LABEL = 'Wallets';
const SECTION_SECONDARY_TEXT = 'Choose whether to use wallet- and Web3-related terminology in your modal.';

export const WalletsConfigurator: React.FC = () => {
  const [walletsConfig, setWalletsConfig] = useAtom(walletsConfigAtom);

  const onChange = useCallback(
    (isChecked: boolean) => {
      setWalletsConfig({ hideWallets: isChecked });
    },
    [walletsConfig],
  );

  return (
    <AccordionItem value="wallets">
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <ContentWrapper>
          <SwitchItem
            key="hideWallets"
            label="Remove Wallet Terminology"
            isChecked={walletsConfig.hideWallets}
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
