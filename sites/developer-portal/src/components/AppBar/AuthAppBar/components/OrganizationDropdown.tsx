import { Button, DropdownMenuSeparator } from '@getpara/react-component-library';
import {
  useGetAllOrganizationsWithAccess,
  useGetSelectedOrganization,
} from '../../../../hooks/api/queries/useOrganizations';
import { NavDropdown } from './NavDropdown';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export const OrganizationDropdown = () => {
  const { data: organization } = useGetSelectedOrganization();
  const { data: orgsWithAccess } = useGetAllOrganizationsWithAccess();
  const [isNavOpen, setIsNavOpen] = useState(false);

  if (!organization || !orgsWithAccess?.length) {
    return null;
  }

  return (
    <NavDropdown
      selected={{
        id: organization.id,
        name: organization.name,
        badge: organization.activePlanSlug,
        iconUrl: organization.logoUrl,
      }}
      options={orgsWithAccess.map(org => ({ id: org.id, name: org.name, badge: org.activePlanSlug, iconUrl: org.logoUrl }))}
      pathPrefix="/"
      pathSuffix="/dashboard"
      isOpen={isNavOpen}
      setIsOpen={setIsNavOpen}
    >
      <>
        <DropdownMenuSeparator />
        <div className="para:p-1">
          <Button size="sm" variant="outline" className="para:w-full">
            <Plus className="para:size-4 para:stroke-foreground" />
            Create Organization
          </Button>
        </div>
      </>
    </NavDropdown>
  );
};
