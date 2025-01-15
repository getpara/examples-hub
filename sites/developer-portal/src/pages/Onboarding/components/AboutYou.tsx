import { CenteredText } from '../../../components/common';
import { InnerOnboardingContainer } from './common';
import { Controls } from './Controls';
import { aboutYouQuestions } from '../config/questionConfig';
import { QuestionInput } from './QuestionInput';

export const AboutYou = () => {
  return (
    <>
      <CenteredText variant="headingS" weight="semiBold">
        Tell us a little bit about yourself.
      </CenteredText>
      <InnerOnboardingContainer>
        {aboutYouQuestions.map(q => (
          <QuestionInput key={q} question={q} />
        ))}
        <Controls questions={aboutYouQuestions} />
      </InnerOnboardingContainer>
    </>
  );
};
