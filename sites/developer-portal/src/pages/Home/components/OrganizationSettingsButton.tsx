import { Button } from '@getpara/react-component-library';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { Link, useParams } from 'react-router-dom';

export const OrganizationSettingsButton = () => {
  const { organizationId } = useParams();
  const { data: capabilities } = useOrganizationMemberCapabilities();

  if (!capabilities?.canUpdateOrganization) {
    return null;
  }

  return (
    <Link to={`/${organizationId}/dashboard/settings`}>
      <Button variant="secondary">Organization Settings</Button>
    </Link>
  );
};
