import { PropsWithChildren } from 'react';

export const OnboardingQuestionContainer = ({ children }: PropsWithChildren) => (
  <div className="para:p-8 para:bg-card para:rounded-xl para:flex para:flex-col para:gap-8 para:sm:w-[437px]">
    {children}
  </div>
);
