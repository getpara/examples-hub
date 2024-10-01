import { CpslButton, CpslCard, CpslHero, CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';
import { useCanCreateProject } from '../../../hooks/subscriptionGating/useCanCreateProject';

interface AddProjectCardProps {
  isFirstProject: boolean;
  onClick: () => void;
}

export const AddProjectCard = ({ isFirstProject, onClick }: AddProjectCardProps) => {
  const { canCreateProject } = useCanCreateProject();

  if (!canCreateProject) {
    return null;
  }

  return (
    <StyledCard>
      <HeroContainer>
        <StyledHero variant="add" hideFadeOut />
      </HeroContainer>
      <Container>
        <CpslButton onClick={onClick}>
          {isFirstProject ? 'Get Started' : 'Create Project'}
          {isFirstProject && <CpslIcon icon="arrowNarrow" />}
        </CpslButton>
      </Container>
    </StyledCard>
  );
};

const StyledCard = styled(CpslCard)`
  --card-padding-bottom: 28px;

  &::part(card-container) {
    height: 240px;
    width: 240px;

    position: relative;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: flex-end;
  justify-content: center;
  z-index: 10;
`;

const HeroContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const StyledHero = styled(CpslHero)`
  height: 100%;
  top: -36px;
  --ring-3-size: 346px;
  --ring-2-size: 250px;
  --ring-1-size: 140px;
  --ring-0-size: 65px;
  --center-icon-size: 40px;
`;
