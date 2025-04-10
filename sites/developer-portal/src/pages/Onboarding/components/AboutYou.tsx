import { OnboardingQuestionContainer } from './common';
import { Controls } from './Controls';
import { aboutYouQuestions } from '../config/questionConfig';
import { QuestionInput } from './QuestionInput';
import { Typography } from '@getpara/react-component-library';

export const AboutYou = () => {
  return (
    <>
      <Typography className="para:text-3xl para:font-semibold para:text-center">
        Tell us a little bit about yourself.
      </Typography>
      <OnboardingQuestionContainer>
        {aboutYouQuestions.map(q => (
          <QuestionInput key={q} question={q} />
        ))}
        <Controls />
      </OnboardingQuestionContainer>
    </>
  );
};
