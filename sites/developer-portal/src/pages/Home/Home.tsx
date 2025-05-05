import { useState } from 'react';
import { Analytics } from './components/Analytics';
import { Projects } from './components/Projects';
import { AllProjects } from './components/AllProjects';

export const Home = () => {
  const [showAllProjects, setShowAllProjects] = useState(false);

  return (
    <div>
      {showAllProjects ? (
        <AllProjects onBackClick={() => setShowAllProjects(false)} />
      ) : (
        <>
          <Projects onShowAllClick={() => setShowAllProjects(true)} />
          <div className="para:h-[1px] para:bg-border para:max-w-screen para:w-[calc(100%+48px)] para:-ml-4 para:md:-ml-6" />
          <Analytics />
        </>
      )}
    </div>
  );
};
