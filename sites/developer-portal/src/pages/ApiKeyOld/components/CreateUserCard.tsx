import { CpslInput, CpslText } from '@getpara/react-components';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';
import { ExternalLinkButton } from '../../../components/ExternalLinkButton/ExternalLinkButton';
import { DOCS_LINK } from '../../../utils/constants';
import { InnerConfigurationCard } from './InnerConfigurationCard';
import { useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../../hooks/api/queries/useApiKeySetupStatus';
import { formatPhoneNumber } from '@getpara/web-sdk';

export const CreateUserCard = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');

  let userString = 'no user yet';

  const user = status?.firstUser?.user;
  if (user) {
    const formattedPhone = user.phone ? formatPhoneNumber(user.phone.number, user.phone.countryCode) : undefined;

    userString = user.email ?? formattedPhone ?? user.externalWallets?.[0]?.address ?? user.id;
  }

  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <CpslText variant="bodyL" weight="semiBold">
            Create User
          </CpslText>
          <CpslText variant="bodyS" color="secondary">
            Confirm your Para instance has been integrated correctly and is working by adding yourself as your first user.
          </CpslText>
          <ExternalLinkButton link={DOCS_LINK} text="Creating Users" size="small" />
        </SplitCardInnerContainer>
      }
      RightContent={
        <SplitCardInnerContainer>
          <InnerConfigurationCard>
            <CpslText color="secondary">
              Launch the modal in your app and complete the onboarding flow to create a user. The email, phone number or
              external address of the created user will appear here.
            </CpslText>
            <CpslInput value={userString} disabled />
          </InnerConfigurationCard>
        </SplitCardInnerContainer>
      }
    />
  );
};
