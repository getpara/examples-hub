'use client';

import { Loader } from '@getpara/react-component-library';
import { PageWrapper } from './PageWrapper';

export const PageLoader = () => {
  return (
    <PageWrapper>
      <Loader className="para:size-14 para:flex-1" />
    </PageWrapper>
  );
};
