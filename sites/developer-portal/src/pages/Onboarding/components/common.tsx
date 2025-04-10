import { PropsWithChildren } from 'react';
import { styled } from 'styled-components';

export const InnerOnboardingContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 325px;
  padding-top: 16px;
`;

export const OnboardingQuestionContainer = ({ children }: PropsWithChildren) => (
  <div className="para:p-8 para:bg-card para:rounded-xl para:flex para:flex-col para:gap-8 para:w-[437px]">{children}</div>
);
