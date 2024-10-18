import { CpslAlert } from '@usecapsule/react-components';
import styled from 'styled-components';
import { InlineText } from '../../../components/common';
import { useParams } from 'react-router-dom';
import { useGetAvailableKeyEnvs, useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { formatEnvName } from '../../../utils/apiKey';
import { IS_BETA, IS_PROD } from '../../../utils/constants';
import { useOrganizationTotalUserCount } from '../../../hooks/api/queries/useOrganizationTotalUserCount';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';

interface NonProdWarningProps {
  onCreateProdKeyClick: () => void;
}

export const NonProdWarning = ({ onCreateProdKeyClick }: NonProdWarningProps) => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const { data: totalUsers } = useOrganizationTotalUserCount();
  const { data: subscription } = useGetOrganizationSubscription();

  const activePlan = subscription?.plan;
  const maxBetaUsers = activePlan?.maxBetaUsers ?? 0;

  if (
    !apiKeyData ||
    (apiKeyData.environment.toUpperCase() as Environment) === Environment.PROD ||
    apiKeyData.environment.toString().toUpperCase() === 'PRODUCTION'
  ) {
    return null;
  }

  const canCreateProdKey = availableKeyEnvs?.includes(IS_PROD ? Environment.PROD : Environment.BETA);

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
        {((IS_PROD && apiKeyData.environment === Environment.BETA) ||
          (IS_BETA && apiKeyData.environment === Environment.SANDBOX)) && (
          <InlineText>{` You have used ${totalUsers?.lowerEnvCount}/${maxBetaUsers} ${IS_PROD ? 'BETA' : 'SANDBOX'} test users.`}</InlineText>
        )}
      </InlineText>
    </StyledAlert>
  );
};

const StyledAlert = styled(CpslAlert)`
  --container-align-items: flex-start;

  --title-container-gap: 16px;
`;

const ClickableText = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

const UnderlinedInlineText = styled(InlineText)`
  text-decoration: underline;
`;
