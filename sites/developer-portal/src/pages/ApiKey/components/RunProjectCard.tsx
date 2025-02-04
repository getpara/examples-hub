import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';
import { ExternalLinkButton } from '../../../components/ExternalLinkButton/ExternalLinkButton';
import { DOCS_LINK } from '../../../utils/constants';
import { InnerConfigurationCard } from './InnerConfigurationCard';
import { Framework } from '../../../types/framework';
import styled from 'styled-components';
import { formatFrameworkName, getFrameworkCodeSnippet, getFrameworkExtraSetupLink } from '../../../utils/framework';
import { CodeBlock } from '../../../components/CodeBlock/CodeBlock';

interface RunProjectCardProps {
  framework: Framework;
}

export const RunProjectCard = ({ framework }: RunProjectCardProps) => {
  const codeSnippet = getFrameworkCodeSnippet(framework);
  const extraSetupLink = getFrameworkExtraSetupLink(framework);

  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <CpslText variant="bodyL" weight="semiBold">
            Run Project
          </CpslText>
          <CpslText variant="bodyS" color="secondary">
            Use these code snippets to quickly get up and running with your new project.
          </CpslText>
          <ExternalLinkButton link={DOCS_LINK} text="Get Started" size="small" />
        </SplitCardInnerContainer>
      }
      RightContent={
        <SplitCardInnerContainer>
          {codeSnippet && (
            <InnerConfigurationCard>
              <CodeSnippetContainer>
                <CpslText variant="bodyM" weight="medium">
                  Copy and Paste Code Snippet
                  <CpslText variant="bodyM" weight="medium" color="tertiary">
                    After you add this code, run the project to complete the step.
                  </CpslText>
                </CpslText>
                <CodeBlock snippet={codeSnippet} />
              </CodeSnippetContainer>
            </InnerConfigurationCard>
          )}
          {extraSetupLink && (
            <a href={extraSetupLink} target="_blank">
              <ExtraSetupButton $extraLarge={!codeSnippet} fullWidth variant="secondary">
                {formatFrameworkName(framework)} requires extra setup. Follow our guide here
                <CpslIcon slot="end" icon="arrowNarrow" />
              </ExtraSetupButton>
            </a>
          )}
        </SplitCardInnerContainer>
      }
    />
  );
};

const CodeSnippetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ExtraSetupButton = styled(CpslButton)<{ $extraLarge?: boolean }>`
  ${({ $extraLarge }) => $extraLarge && 'height: 104px;'};
`;
