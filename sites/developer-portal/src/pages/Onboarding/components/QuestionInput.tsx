import { Controller, useFormContext } from 'react-hook-form';
import { OnboardingAnswerOption, OnboardingAnswers, QuestionType } from '../../../types/onboarding';
import {
  questionLabel,
  questionPlaceholder,
  questionRules,
  questionType,
  selectQuestionOptions,
} from '../config/questionConfig';
import { useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { useAccount } from '@getpara/react-sdk';
import {
  Input,
  Label,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typography,
} from '@getpara/react-component-library';

interface QuestionInputProps {
  question: OnboardingAnswerOption;
}

export const QuestionInput = ({ question }: QuestionInputProps) => {
  const { data: account } = useAccount();
  const userId = account?.userId;
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
          render={({ field: { onChange }, fieldState: { error } }) => (
            <div className="para:w-full para:flex para:flex-col para:gap-2">
              <Label htmlFor={question}>{questionLabel[question]}</Label>
              <Select
                onValueChange={value => {
                  if (userId) {
                    setInput(userId, question, value);
                    onChange(value);
                  }
                }}
              >
                <SelectTrigger className="para:w-full para:h-12">
                  <SelectValue placeholder={questionPlaceholder[question]} />
                </SelectTrigger>
                <SelectContent>
                  {selectQuestionOptions[question].map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!!error && (
                <Typography color="destructive" className="para:text-xs">
                  {error.message}
                </Typography>
              )}
            </div>
          )}
        />
      );
    }
    case QuestionType.MULTI_SELECT: {
      return (
        <Controller
          key={question}
          name={question}
          control={control}
          rules={questionRules[question]}
          render={({ field: { onChange }, fieldState: { error } }) => (
            <div className="para:w-full para:flex para:flex-col para:gap-2">
              <Label htmlFor={question}>{questionLabel[question]}</Label>
              <MultiSelect
                className="para:min-h-12"
                options={selectQuestionOptions[question]}
                placeholder={questionPlaceholder[question]}
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                }
                onChange={options => {
                  if (userId) {
                    const _options = options.map(o => o.value);
                    setInput(userId, question, _options);
                    onChange(_options);
                  }
                }}
                hideClearAllButton
              />
              {!!error && (
                <Typography color="destructive" className="para:text-xs">
                  {error.message}
                </Typography>
              )}
            </div>
          )}
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
          render={({ field: { onChange, onBlur }, fieldState: { error } }) => (
            <div className="para:w-full para:flex para:flex-col para:gap-2">
              <Label htmlFor={question}>{questionLabel[question]}</Label>
              <Input
                className="para:h-12"
                type={question}
                id={question}
                placeholder={questionPlaceholder[question]}
                onChange={e => {
                  if (userId) {
                    setInput(userId, question, e.currentTarget.value);
                    onChange(e);
                  }
                }}
                onBlur={onBlur}
              />
              {!!error && (
                <Typography color="destructive" className="para:text-xs">
                  {error.message}
                </Typography>
              )}
            </div>
          )}
        />
      );
    }
    default: {
      return null;
    }
  }
};
