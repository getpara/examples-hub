import { DOCS_LINK } from '../../../utils/constants';
import { Dispatch, SetStateAction } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ParaIconBrand } from '@getpara/react-component-library';
import { FileText, HelpCircle } from 'lucide-react';
import { OrganizationDropdown } from './components/OrganizationDropdown';
import { ProjectDropdown } from './components/ProjectDropdown';
import { ApiKeyDropdown } from './components/ApiKeyDropdown';
import { AccountDropdown } from './components/AccountDropdown';
import { NavLink } from './components/NavLink';

export const AUTH_APP_BAR_HEIGHT = 57;

interface AuthAppBarProps {
  setNavOpen: Dispatch<SetStateAction<boolean>>;
}

export const AuthAppBar = ({}: AuthAppBarProps) => {
  const { organizationId } = useParams();

  return (
    <>
      <nav className="para:w-full para:fixed para:h-[57px] para:border-b para:border-border para:bg-background para:py-2 para:px-6 para:flex para:items-center para:justify-between">
        <div className="para:h-full para:flex para:gap-4 para:items-center">
          <Link to={`/${organizationId}/dashboard`}>
            <ParaIconBrand className="para:w-[22px] para:h-5" />
          </Link>
          <OrganizationDropdown />
          <ProjectDropdown />
          <ApiKeyDropdown />
        </div>
        <div className="para:flex para:items-center para:gap-4">
          <NavLink to="/" Icon={HelpCircle} text="Help" />
          <NavLink to={DOCS_LINK} Icon={FileText} text="Docs" />
          <AccountDropdown />
        </div>
      </nav>
      <div className="para:h-[57px]" />
    </>
  );
};
