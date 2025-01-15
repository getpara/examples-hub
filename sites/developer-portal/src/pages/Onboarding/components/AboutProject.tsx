import { CenteredText } from '../../../components/common';
import { InnerOnboardingContainer } from './common';
import { Controls } from './Controls';
import { aboutProjectQuestions } from '../config/questionConfig';
import { QuestionInput } from './QuestionInput';

export const AboutProject = () => {
  return (
    <>
      <CenteredText variant="headingS" weight="semiBold">
        What are you building?
      </CenteredText>
      <InnerOnboardingContainer>
        {aboutProjectQuestions.map(q => (
          <QuestionInput key={q} question={q} />
        ))}
        <Controls questions={aboutProjectQuestions} />
      </InnerOnboardingContainer>
    </>
  );
};
