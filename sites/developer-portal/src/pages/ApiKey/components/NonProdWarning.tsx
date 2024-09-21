import { CpslAlert } from '@usecapsule/react-components';
import styled from 'styled-components';
import { InlineText } from '../../../components/common';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { formatEnvName } from '../../../utils/apiKey';

export const NonProdWarning = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  if (!apiKeyData || (apiKeyData.environment as Environment) === Environment.PROD) {
    return null;
  }

  // TODO: add beta user count here once BE restrictions are in place
  // TODO: add link here to copy to prod config once the copy config PR is merged
  return (
    <StyledAlert variant="warning" icon="alertTriangle" filled>
      <InlineText>
        You are currently in the{' '}
        <InlineText weight="bold">{formatEnvName(apiKeyData?.environment as Environment)?.toUpperCase()}</InlineText>{' '}
        environment for internal testing only. Before launching your app, create a{' '}
        <InlineText weight="bold">PRODUCTION</InlineText> key.
      </InlineText>
    </StyledAlert>
  );
};

const StyledAlert = styled(CpslAlert)`
  --container-justify-content: flex-start;

  --title-container-gap: 16px;
`;
