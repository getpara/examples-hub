import { Loader } from '@getpara/react-component-library';

export const MainLoader = () => {
  return (
    <div className="para:flex para:justify-center para:items-center para:w-full para:h-[calc(100vh-var(--appbar-height-mobile))] para:lg:h-[calc(100vh-var(--appbar-height))]">
      <Loader className="para:mx-auto para:size-14  " />
    </div>
  );
};
