import { Controller, useFormContext } from 'react-hook-form';
import { OnboardingAnswerOption, OnboardingAnswers, QuestionType } from '../../../types/onboarding';
import { CpslInput, CpslSelect, CpslSelectItem } from '@getpara/react-components';
import {
  questionIsMultipleSelect,
  questionLabel,
  questionPlaceholder,
  questionRules,
  questionType,
  selectQuestionOptions,
} from '../config/questionConfig';
import { useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { para } from '../../../clients/para';

interface QuestionInputProps {
  question: OnboardingAnswerOption;
}

export const QuestionInput = ({ question }: QuestionInputProps) => {
  const userId = para.getUserId();
  const setInput = useOnboardingStore(state => state.setInput);
  const { control } = useFormContext<OnboardingAnswers>();

  switch (questionType[question]) {
    case QuestionType.SELECT: {
      return (
        <Controller
          key={question}
          name={question}
          control={control}
          rules={questionRules[question]}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
            const isMultiple = questionIsMultipleSelect[question];
            return (
              <CpslSelect
                label={questionLabel[question]}
                selectedValue={value ?? ''}
                onCpslSelectValueChange={e => {
                  let newVal;
                  if (isMultiple && typeof value !== 'string') {
                    if (value?.includes(e.detail)) {
                      newVal = value.filter(v => v !== e.detail);
                    } else {
                      newVal = [...(value ?? []), e.detail];
                    }
                  } else {
                    newVal = e.detail;
                  }
                  if (userId) {
                    setInput(userId, question, newVal);
                    onChange(newVal);
                  }
                }}
                onCpslBlur={onBlur}
                errorText={error?.message}
                placeholder={questionPlaceholder[question]}
                multiple={isMultiple}
              >
                {selectQuestionOptions[question].map(o => (
                  <CpslSelectItem key={o} slot="items" value={o}>
                    {o}
                  </CpslSelectItem>
                ))}
              </CpslSelect>
            );
          }}
        />
      );
    }
    case QuestionType.TEXT: {
      return (
        <Controller
          key={question}
          name={question}
          control={control}
          rules={questionRules[question]}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <CpslInput
              label={questionLabel[question]}
              placeholder={questionPlaceholder[question]}
              onCpslInput={e => {
                if (userId) {
                  setInput(userId, question, e.detail.value);
                  onChange(e.detail.value);
                }
              }}
              onCpslBlur={onBlur}
              value={(value as string) ?? ''}
              errorText={error?.message}
            />
          )}
        />
      );
    }
    default: {
      return null;
    }
  }
};
