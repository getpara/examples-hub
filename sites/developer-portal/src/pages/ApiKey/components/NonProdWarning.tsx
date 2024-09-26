import { CpslAlert } from '@usecapsule/react-components';
import styled from 'styled-components';
import { InlineText } from '../../../components/common';
import { useParams } from 'react-router-dom';
import { useGetAvailableKeyEnvs, useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { formatEnvName } from '../../../utils/apiKey';
import { IS_BETA, IS_PROD } from '../../../utils/constants';

interface NonProdWarningProps {
  onCreateProdKeyClick: () => void;
}

export const NonProdWarning = ({ onCreateProdKeyClick }: NonProdWarningProps) => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');

  if (!apiKeyData || (apiKeyData.environment as Environment) === Environment.PROD) {
    return null;
  }

  const canCreateProdKey = availableKeyEnvs?.includes(IS_PROD ? Environment.PROD : Environment.BETA);

  // TODO: add beta user count here once BE restrictions are in place
  return (
    <StyledAlert variant="warning" icon="alertTriangle" filled>
      <InlineText>
        You are currently in the{' '}
        <InlineText weight="bold">{formatEnvName(apiKeyData?.environment as Environment)?.toUpperCase()}</InlineText>{' '}
        environment for internal testing only.
        {(IS_PROD || IS_BETA) && canCreateProdKey && (
          <>
            {' '}
            Before launching your app,{' '}
            <ClickableText onClick={onCreateProdKeyClick}>
              create a <UnderlinedInlineText weight="bold">{IS_PROD ? 'PRODUCTION' : 'BETA'}</UnderlinedInlineText> key
            </ClickableText>
            .
          </>
        )}
      </InlineText>
    </StyledAlert>
  );
};

const StyledAlert = styled(CpslAlert)`
  --container-justify-content: flex-start;

  --title-container-gap: 16px;
`;

const ClickableText = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

const UnderlinedInlineText = styled(InlineText)`
  text-decoration: underline;
`;
