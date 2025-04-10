import { OnboardingQuestionContainer } from './common';
import { Controls } from './Controls';
import { aboutProjectQuestions } from '../config/questionConfig';
import { QuestionInput } from './QuestionInput';
import { Typography } from '@getpara/react-component-library';

export const AboutProject = () => {
  return (
    <>
      <Typography className="para:text-3xl para:font-semibold para:text-center">What are you building?</Typography>
      <OnboardingQuestionContainer>
        {aboutProjectQuestions.map(q => (
          <QuestionInput key={q} question={q} />
        ))}
        <Controls />
      </OnboardingQuestionContainer>
    </>
  );
};
