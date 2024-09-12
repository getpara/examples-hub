import { CpslButton, CpslIcon, CpslInput, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { MOBILE_SIZE } from '../../../utils/constants';
import { useState } from 'react';
import { EnvIcon } from '../../../components/common';
import { Environment } from '../../../types/environment';
import { useParams } from 'react-router-dom';
import { formatEnvName } from '../../../utils/apiKey';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';

export const KeyData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const [isVisible, setIsVisible] = useState(false);

  const handleVisibilityClick = () => {
    setIsVisible(curr => !curr);
  };

  return (
    <Container>
      <CpslText variant="headingS" weight="semiBold">
        {apiKeyData?.displayName}
      </CpslText>
      <InnerContainer>
        <DisabledInput
          label="API Key"
          value={apiKeyData?.apiKey}
          type={isVisible ? 'text' : 'password'}
          disabled
          noAutoDisable
        >
          <CpslButton onClick={handleVisibilityClick} slot="end" variant="ghost">
            <CpslIcon icon={isVisible ? 'eyeOff' : 'eye'} />
          </CpslButton>
        </DisabledInput>
        <DisabledInput label="Environment" value={formatEnvName(apiKeyData?.environment as Environment)} disabled>
          <EnvIcon slot="start" $environment={apiKeyData?.environment as Environment} />
        </DisabledInput>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: ${MOBILE_SIZE}px) {
    gap: 16px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    gap: 24px;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: ${MOBILE_SIZE}px) {
    flex-direction: column;
  }
`;

const DisabledInput = styled(CpslInput)`
  width: 375px;
  --input-color: var(--cpsl-color-text-primary);
`;
