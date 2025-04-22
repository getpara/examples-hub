import { CpslButton } from '@getpara/react-components';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { useGetAvailableKeyEnvs } from '../../../hooks/api/queries/useOrganizationKeys';
import { useParams } from 'react-router-dom';
import { IS_PROD } from '../../../utils/constants';
import { Environment } from '../../../types/environment';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

interface CreateProductionKeyProps {
  onClick: () => void;
}

export const CreateProductionKeyButton = ({ onClick }: CreateProductionKeyProps) => {
  const { projectId } = useParams();
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const {
    formState: { isValid },
  } = useFormContext();

  const isVisible = availableKeyEnvs?.includes(IS_PROD ? Environment.PROD : Environment.BETA);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <CopyButton size="small" disabled={!isValid || !orgValid} onClick={onClick}>
        Create {IS_PROD ? 'Production' : 'Beta'} Key
      </CopyButton>
    </>
  );
};

const CopyButton = styled(CpslButton)`
  &::part(button-native) {
    min-width: 140px;
  }
`;
