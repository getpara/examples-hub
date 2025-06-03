import { DOCS_LINK, SUPPORT_URL } from '../../../utils/constants';
import { Link, useParams } from 'react-router-dom';
import { Button, cn, ParaIconBrand, useSidebar } from '@getpara/react-component-library';
import { FileText, HelpCircle, PanelLeftClose } from 'lucide-react';
import { OrganizationDropdown } from '../../NavComponents/OrganizationDropdown';
import { ProjectDropdown } from '../../NavComponents/ProjectDropdown';
import { ApiKeyDropdown } from '../../NavComponents/ApiKeyDropdown';
import { AccountDropdown } from './components/AccountDropdown';
import { NavLink } from './components/NavLink';

export const AUTH_APP_BAR_HEIGHT = 57;

interface AuthAppBarProps {}

export const AuthAppBar = ({}: AuthAppBarProps) => {
  const { organizationId, projectId, apiKey } = useParams();
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <nav className="para:w-full para:fixed para:h-[var(--appbar-height-mobile)] para:lg:h-[var(--appbar-height)] para:border-b para:border-border para:bg-background para:py-2 para:px-2 para:lg:px-6 para:flex para:items-center para:justify-between para:z-[50]">
        <div className="para:h-full para:flex para:gap-4 para:items-center para:min-w-0">
          <Link to={`/${organizationId}/dashboard`} className="para:hidden para:lg:flex">
            <ParaIconBrand className="para:w-[22px] para:h-5" />
          </Link>
          <div className="para:flex para:gap-0 para:md:gap-4 para:items-center para:min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn('para:size-6 para:mr-4 para:hidden para:md:hidden', {
                'para:block': !!apiKey,
              })}
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="para:size-6" />
            </Button>
            <OrganizationDropdown
              className={cn('para:block para:md:block para:min-w-0', {
                'para:hidden': !!projectId,
              })}
            />
            <ProjectDropdown />
            <ApiKeyDropdown />
          </div>
        </div>
        <div className="para:flex para:items-center para:gap-4">
          <NavLink to={SUPPORT_URL} Icon={HelpCircle} text="Help" />
          <NavLink to={DOCS_LINK} Icon={FileText} text="Docs" />
          <AccountDropdown />
        </div>
      </nav>
    </>
  );
};
