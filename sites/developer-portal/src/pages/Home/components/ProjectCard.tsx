import { CpslCard, CpslIcon, CpslText } from '@usecapsule/react-components';
import { Project } from '../../../types/api';
import styled from 'styled-components';
import { useProjectTotalUsersCount } from '../../../hooks/api/queries/useProjectTotalUsersCount';
import { truncateNumber } from '../../../utils/formatNumber';
import { useNavigate, useParams } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { organizationId } = useParams();

  const { data: totalUsers } = useProjectTotalUsersCount(project.id);

  const handleClick = () => {
    navigate(`/${organizationId}/project/${project.id}`);
  };

  return (
    <StyledCard onClick={handleClick}>
      <Container>
        {project.iconUrl && <ProjectIcon src={project.iconUrl} />}
        <NameContainer>
          <CpslText variant="bodyL" weight="semiBold">
            {project.name}
          </CpslText>
          {project.description && (
            <CpslText variant="bodyS" color="secondary" weight="medium">
              {project.description}
            </CpslText>
          )}
        </NameContainer>
        <DataContainer>
          <CpslText variant="bodyXS" color="tertiary" weight="medium">
            {totalUsers !== undefined ? truncateNumber(totalUsers) : '--'} Users
          </CpslText>
        </DataContainer>
      </Container>
    </StyledCard>
  );
};

const StyledCard = styled(CpslCard)`
  --card-padding-bottom: 16px;
  --card-padding-end: 36px;

  cursor: pointer;

  &::part(card-container) {
    height: 240px;
    width: 240px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DataContainer = styled.div`
  margin-top: auto;
  display: flex;
`;

const ProjectIcon = styled(CpslIcon)`
  --height: 44px;
  --width: 44px;
`;
