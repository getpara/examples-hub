import { ParaBrand } from '@getpara/react-component-library';

export const AUTH_MIN_APP_BAR_HEIGHT = 70;

export const AuthMinAppBar = () => {
  return (
    <>
      <nav className="para:w-full para:fixed para:h-[70px] para:pl-[31px] para:flex para:items-center para:bg-muted">
        <ParaBrand className="para:w-auto" />
      </nav>
      <div className="para:h-[70px]" />
    </>
  );
};
