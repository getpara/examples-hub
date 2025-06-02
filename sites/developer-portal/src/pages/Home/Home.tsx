import { useState } from 'react';
import { Analytics } from './components/Analytics';
import { Projects } from './components/Projects';
import { AllProjects } from './components/AllProjects';
import { EmptyState } from './components/EmptyState';
import { useGetAllProjects } from '../../hooks/api/queries/useProjects';
import { Loader } from '@getpara/react-component-library';
import { SettingsSheet } from './components/SettingsSheet';
import { Notifications } from './components/Notifications';

export const Home = () => {
  const { data: projects, isLoading: isLoadingProjects } = useGetAllProjects();
  const [showAllProjects, setShowAllProjects] = useState(false);

  const hasProjects = projects && projects.length > 0;

  if (isLoadingProjects) {
    return <Loader className="para:m-auto para:size-14" />;
  }

  return (
    <>
      <div>
        {!hasProjects ? (
          <EmptyState />
        ) : (
          <>
            {showAllProjects ? (
              <AllProjects onBackClick={() => setShowAllProjects(false)} />
            ) : (
              <>
                <Notifications />
                <Projects onShowAllClick={() => setShowAllProjects(true)} />
                <Analytics />
              </>
            )}
          </>
        )}
      </div>
      <SettingsSheet />
    </>
  );
};
