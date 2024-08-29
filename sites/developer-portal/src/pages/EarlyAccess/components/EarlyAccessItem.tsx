import { CpslButton, CpslCard, CpslIcon, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { EarlyAccess } from '../../../types/earlyAccess';
import { GradientCTAButton } from '../../../components/GradientCTAButton/GradientCTAButton';
import defaultImage from '../assets/defaultImage.png';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';

interface EarlyAccessProps extends EarlyAccess {
  isHigherPlanRequired: boolean;
  hasAccess: boolean;
  requestedAccess: boolean;
  onRequestClick: (slug: string) => void;
  onUpgradeClick: (planSlug: string) => void;
}

export const EarlyAccessItem = ({
  name,
  description,
  image,
  link,
  slug,
  planSlug,
  isHigherPlanRequired,
  hasAccess,
  requestedAccess,
  onRequestClick,
  onUpgradeClick,
}: EarlyAccessProps) => {
  const { data: org } = useGetSelectedOrganization();

  let RequestButtonContent = <>Request Access</>;
  let buttonDisabled = false;

  if (requestedAccess) {
    RequestButtonContent = <>Access Requested</>;
    buttonDisabled = true;
  }
  if (hasAccess) {
    RequestButtonContent = (
      <>
        <CpslIcon slot="start" icon="eye" />
        View Feature
      </>
    );
    buttonDisabled = false;
  }

  const handleRequestAccessClick = () => {
    if (!hasAccess) {
      onRequestClick(slug);
    }
  };

  const handleUpgradeClick = () => {
    if (!hasAccess) {
      onUpgradeClick(planSlug);
    }
  };

  return (
    <Card>
      <Content>
        <ImageContainer>
          <Image src={image || defaultImage} alt={`${name}-image`} />
          {!image && <ImageText>{name}</ImageText>}
        </ImageContainer>
        <InfoContainer>
          <CpslText weight="bold">{name}</CpslText>
          <CpslText weight="bold" variant="bodyXS" color="secondary">
            {description}
          </CpslText>
        </InfoContainer>
        <ButtonContainer>
          {isHigherPlanRequired && !hasAccess ? (
            <GradientCTAButton disabled={org?.hasRequestedUpgrade} fullWidth onClick={handleUpgradeClick}>
              Upgrade for Access
            </GradientCTAButton>
          ) : (
            <CpslButton
              fullWidth
              disabled={buttonDisabled}
              onClick={handleRequestAccessClick}
              as={hasAccess ? 'a' : 'button'}
              href={link}
              target="blank"
            >
              {RequestButtonContent}
            </CpslButton>
          )}
        </ButtonContainer>
      </Content>
    </Card>
  );
};

const Card = styled(CpslCard)`
  --card-padding-start: 16px;
  --card-padding-end: 16px;
  --card-padding-top: 16px;
  --card-padding-bottom: 16px;

  &::part(card-container) {
    height: 100%;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
  height: 100%;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
  flex: 1;
`;

const Image = styled.img`
  height: 110px;
  width: 100%;
  border-radius: 16px;
  object-fit: fill;
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImageText = styled(CpslText)`
  position: absolute;
  color: #ffffff;
`;
