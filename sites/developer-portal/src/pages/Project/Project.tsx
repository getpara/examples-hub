import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';
import { Table, TableData } from '../../components/Table/Table';
import { EnvironmentCell } from './components/EnvironmentCell';
import { GradientButton } from '../../components/common';
import { CreateKeyModal } from './components/CreateKeyModal';
import { useIsMobile } from '../../hooks/useIsMobile';
import { formatDate } from '../../utils/formatDate';
import { useNavigate, useParams } from 'react-router-dom';
import { MOBILE_SIZE } from '../../utils/constants';
import { useGetAllOrganizationKeys } from '../../hooks/api/queries/useOrganizationKeys';
import { useGetProject } from '../../hooks/api/queries/useProjects';
import { triggerToast } from '../../utils/toasts';

const PAGE_SIZE = 6;

export const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isMobile = useIsMobile();
  const { data: apiKeys } = useGetAllOrganizationKeys(projectId ?? '');
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleEditClick = useCallback(
    (id: string, env: string) => () => {
      navigate(`/project/${projectId}/key/${env}/${id}`);
    },
    [navigate, projectId],
  );

  const formattedData: TableData[] = useMemo(
    () =>
      apiKeys?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map(
        d =>
          ({
            key: d.id,
            data: [
              {
                key: 'name',
                value: d.displayName,
              },
              {
                key: 'environment',
                value: <EnvironmentCell environment={d.environment} />,
              },
              {
                key: 'createdAt',
                value: formatDate(d.createdAt),
              },
              {
                key: 'edit',
                value: (
                  <CpslButton variant="secondary" size="small" onClick={handleEditClick(d.id, d.environment.toLowerCase())}>
                    Edit
                  </CpslButton>
                ),
                fitWidth: true,
              },
            ],
          }) as TableData,
      ) ?? [],
    [apiKeys, page, handleEditClick],
  );

  const handleCreateClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (!projectId) {
    navigate('/');
  }

  if (!isProjectLoading && !project) {
    navigate('/');
    triggerToast({
      variant: 'error',
      title: 'Failed to Load Project',
    });
    return null;
  }

  return (
    <Container>
      <CpslText variant="headingS" weight="semiBold">
        {project?.name}
      </CpslText>
      <Table
        page={page}
        title="API Keys"
        subtitle="Create a new key or edit an existing key."
        data={formattedData}
        totalPages={Math.ceil((apiKeys?.length ?? 0) / PAGE_SIZE)}
        onPageChange={handlePageChange}
        headers={[{ headerName: 'Display Name' }, { headerName: 'Environment' }, { headerName: 'Date Created', colSpan: 2 }]}
        ActionButton={
          <GradientButton onClick={handleCreateClick} size={isMobile ? 'small' : 'medium'}>
            <CpslIcon slot="start" icon="plusCircle" />
            Create
          </GradientButton>
        }
        noContentTitle="No Keys Yet"
        noContentSubtitle="Get started using Capsule by creating a new Beta API Key"
        NoContentActionButton={
          <CpslButton onClick={handleCreateClick}>
            <CpslIcon slot="start" icon="plusCircle" />
            Create API Key
          </CpslButton>
        }
      />
      <CreateKeyModal open={modalOpen} onClose={handleCloseModal} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: ${MOBILE_SIZE}px) {
    margin-top: -16px;
  }
`;
