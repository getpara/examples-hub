import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { CpslText } from '@usecapsule/react-components';
import { AnalyticsCard } from '../../../components/AnalyticsCard/AnalyticsCard';
import { useOrganizationKeyUsersLoginMetrics } from '../../../hooks/api/queries/useOrganizationKeyUsersLoginMetrics';

export const LoginMetrics = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: loginAnalytics } = useOrganizationKeyUsersLoginMetrics(projectId ?? '', apiKey ?? '', env ?? '');

  return (
    <>
      <CpslText variant="bodyL" weight="semiBold">
        Login Method
      </CpslText>
      <Container>
        {loginAnalytics &&
          Object.entries(loginAnalytics).map(([key, value]) => (
            <AnalyticsCard
              key={key}
              title={value < 0.01 ? '< 1%' : value > 0.99 && value < 1 ? '> 99%' : `${Math.round(value * 100)}%`}
              subtitle={key}
            />
          ))}
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
