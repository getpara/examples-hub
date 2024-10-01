import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import { PropsWithChildren, useState } from 'react';
import { DocsButton } from '../../../components/DocsButton/DocsButton';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LearnMoreButton } from '../../../components/LearnMoreButton/LearnMoreButton';

interface ConfigurationCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  docsLink: string;
  defaultOpen?: boolean;
  disableCollapse?: boolean;
  buttonVariant?: 'docs' | 'learnMore';
}


export const ConfigurationCard = ({
  title,
  subtitle,
  docsLink,
  disableCollapse,
  buttonVariant = 'docs',
  defaultOpen = true,
  children,
}: ConfigurationCardProps) => {
  const [height, setHeight] = useState<0 | 'auto'>(defaultOpen || disableCollapse ? 'auto' : 0);

  const handleVisibleClick = () => {
    setHeight(curr => (curr === 'auto' ? 0 : 'auto'));
  };

  const Button = buttonVariant === 'docs' ? DocsButton : LearnMoreButton;

  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <Header variant="bodyL" weight="semiBold">
            {title}
          </Header>
          {subtitle && (
            <CpslText variant="bodyS" color="secondary">
              {subtitle}
            </CpslText>
          )}
          <Button link={docsLink} size="small" />
        </SplitCardInnerContainer>
      }
      RightContent={
        <SplitCardInnerContainer>
          {!disableCollapse && (
            <ExpandButton variant="ghost" onClick={handleVisibleClick}>
              <Chevron icon="chevronUp" $isOpen={height === 'auto'} />
            </ExpandButton>
          )}
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
