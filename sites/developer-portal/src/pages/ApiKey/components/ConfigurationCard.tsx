import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import { PropsWithChildren, useState } from 'react';
import { DocsButton } from '../../../components/DocsButton/DocsButton';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ConfigurationCardProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  docsLink: string;
  defaultOpen?: boolean;
}

export const ConfigurationCard = ({ title, subtitle, docsLink, defaultOpen, children }: ConfigurationCardProps) => {
  const [height, setHeight] = useState<0 | 'auto'>(defaultOpen ? 'auto' : 0);

  const handleVisibleClick = () => {
    setHeight(curr => (curr === 'auto' ? 0 : 'auto'));
  };

  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <Header variant="bodyL" weight="semiBold">
            {title}
          </Header>
          <CpslText variant="bodyS" color="secondary">
            {subtitle}
          </CpslText>
          <DocsButton link={docsLink} size="small" />
        </SplitCardInnerContainer>
      }
      RightContent={
        <SplitCardInnerContainer>
          <ExpandButton variant="ghost" onClick={handleVisibleClick}>
            <Chevron icon="chevronUp" $isOpen={height === 'auto'} />
          </ExpandButton>
          <motion.div animate={{ height }} transition={{ duration: 0.25 }} style={{ height, overflow: 'hidden' }}>
            <SplitCardInnerContainer>{children}</SplitCardInnerContainer>
          </motion.div>
        </SplitCardInnerContainer>
      }
    />
  );
};

const Header = styled(CpslText)`
  height: 24px;
`;

const ExpandButton = styled(CpslButton)`
  align-self: flex-end;
`;

const Chevron = styled(CpslIcon)<{ $isOpen: boolean }>`
  transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')});

  transition: all 0.25s;
`;
