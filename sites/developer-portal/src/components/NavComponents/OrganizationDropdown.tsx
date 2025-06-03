import { Button, DropdownMenuSeparator } from '@getpara/react-component-library';
import { useGetAllOrganizationsWithAccess, useGetSelectedOrganization } from '../../hooks/api/queries/useOrganizations';
import { NavDropdown } from './NavDropdown';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateOrgDialog } from '../CreateOrgDialog/CreateOrgDialog';
import { useCanCreateOrganization } from '../../hooks/subscriptionGating/useCanCreateOrganization';

type OrganizationDropdownProps = {
  className?: string;
};

export const OrganizationDropdown = ({ className }: OrganizationDropdownProps) => {
  const { data: organization } = useGetSelectedOrganization();
  const { data: orgsWithAccess } = useGetAllOrganizationsWithAccess();
  const { canCreateOrg } = useCanCreateOrganization();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (!organization || !orgsWithAccess?.length) {
    return null;
  }

  const handleCreateOrgClick = () => {
    setIsCreateOpen(true);
  };

  return (
    <>
      <NavDropdown
        selected={{
          id: organization.id,
          name: organization.name,
          badge: organization.activePlanSlug,
          iconUrl: organization.logoUrl,
        }}
        options={orgsWithAccess.map(org => ({
          id: org.id,
          name: org.name,
          badge: org.activePlanSlug,
          iconUrl: org.logoUrl,
        }))}
        pathPrefix="/"
        pathSuffix="/dashboard"
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
        className={className}
      >
        {canCreateOrg && (
          <>
            <DropdownMenuSeparator />
            <div className="para:p-1">
              <Button size="sm" variant="outline" className="para:w-full" onClick={handleCreateOrgClick}>
                <Plus className="para:size-4 para:stroke-foreground" />
                Create Organization
              </Button>
            </div>
          </>
        )}
      </NavDropdown>
      <CreateOrgDialog open={isCreateOpen} setOpen={setIsCreateOpen} />
    </>
  );
};
