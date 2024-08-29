import { CpslText } from '@usecapsule/react-components';
import { PropsWithChildren } from 'react';
import { DocsButton } from '../../../components/DocsButton/DocsButton';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';

interface ConfigurationCardProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  docsLink: string;
}

export const ConfigurationCard = ({ title, subtitle, docsLink, children }: ConfigurationCardProps) => {
  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <CpslText variant="bodyL" weight="semiBold">
            {title}
          </CpslText>
          <CpslText variant="bodyS" color="secondary">
            {subtitle}
          </CpslText>
          <DocsButton link={docsLink} size="small" />
        </SplitCardInnerContainer>
      }
      RightContent={<SplitCardInnerContainer>{children}</SplitCardInnerContainer>}
    />
  );
};
