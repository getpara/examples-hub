'use client';

import { PropsWithChildren } from 'react';

export const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="para:bg-muted para:min-w-screen para:min-h-screen para:flex para:items-center para:flex-col">
      {children}
    </div>
  );
};
