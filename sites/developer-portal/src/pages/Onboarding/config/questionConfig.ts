import { RegisterOptions } from 'react-hook-form';
import { OnboardingAnswerOption, OnboardingAnswers, QuestionType } from '../../../types/onboarding';
import { HTTPS_URL_REGEX } from '../../../utils/regex';

export const aboutYouQuestions = [
  OnboardingAnswerOption.USER_NAME,
  OnboardingAnswerOption.TELEGRAM,
  OnboardingAnswerOption.NAME,
  OnboardingAnswerOption.HOMEPAGE_URL,
];

export const aboutProjectQuestions = [
  OnboardingAnswerOption.CURRENT_PROVIDER,
  OnboardingAnswerOption.SUPPORTED_CHAINS,
  OnboardingAnswerOption.HEAR_ABOUT,
];

export const selectQuestionOptions: Record<string, { label: string; value: string }[]> = {
  [OnboardingAnswerOption.CURRENT_PROVIDER]: [
    { label: 'No', value: 'No' },
    { label: 'Yes', value: 'Yes' },
  ],
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: [
    { label: 'Ethereum / EVM', value: 'Ethereum / EVM' },
    { label: 'Solana', value: 'Solana' },
    { label: 'Cosmos', value: 'Cosmos' },
    { label: 'Other', value: 'Other' },
  ],
  [OnboardingAnswerOption.HEAR_ABOUT]: [
    { label: 'Word of mouth', value: 'Word of mouth' },
    { label: 'Twitter', value: 'Twitter' },
    { label: 'Google', value: 'Google' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Youtube', value: 'Youtube' },
    { label: 'Conference', value: 'Conference' },
    { label: 'Other', value: 'Other' },
  ],
};

export const questionType: Record<string, QuestionType> = {
  [OnboardingAnswerOption.USER_NAME]: QuestionType.TEXT,
  [OnboardingAnswerOption.TELEGRAM]: QuestionType.TEXT,
  [OnboardingAnswerOption.NAME]: QuestionType.TEXT,
  [OnboardingAnswerOption.ROLE]: QuestionType.TEXT,
  [OnboardingAnswerOption.HOMEPAGE_URL]: QuestionType.TEXT,
  [OnboardingAnswerOption.CURRENT_PROVIDER]: QuestionType.SELECT,
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: QuestionType.MULTI_SELECT,
  [OnboardingAnswerOption.HEAR_ABOUT]: QuestionType.SELECT,
};

export const questionLabel: Record<string, string> = {
  [OnboardingAnswerOption.USER_NAME]: 'Name',
  [OnboardingAnswerOption.TELEGRAM]: 'Telegram Username',
  [OnboardingAnswerOption.NAME]: 'Name your organization',
  [OnboardingAnswerOption.ROLE]: 'Role',
  [OnboardingAnswerOption.HOMEPAGE_URL]: 'Website URL (Optional)',
  [OnboardingAnswerOption.CURRENT_PROVIDER]: 'Are you already using an embedded wallet provider?',
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: 'What chains does your app support?',
  [OnboardingAnswerOption.HEAR_ABOUT]: 'How did you hear about us?',
};

export const questionPlaceholder: Record<string, string> = {
  [OnboardingAnswerOption.USER_NAME]: 'Enter name',
  [OnboardingAnswerOption.TELEGRAM]: '@markscout',
  [OnboardingAnswerOption.NAME]: 'Acme',
  [OnboardingAnswerOption.ROLE]: 'Enter role',
  [OnboardingAnswerOption.HOMEPAGE_URL]: 'Link to your project or company',
  [OnboardingAnswerOption.CURRENT_PROVIDER]: 'Choose one',
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: 'Choose one or more',
  [OnboardingAnswerOption.HEAR_ABOUT]: 'Choose one',
};

export const questionRules: Record<
  string,
  Omit<RegisterOptions<OnboardingAnswers, any>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
> = {
  [OnboardingAnswerOption.HOMEPAGE_URL]: {
    required: false,
    pattern: {
      value: HTTPS_URL_REGEX,
      message: 'Must be a secure (https) url.',
    },
  },
  [OnboardingAnswerOption.TELEGRAM]: {
    required: false,
  },
  [OnboardingAnswerOption.USER_NAME]: {
    required: 'Name is required.',
  },
  [OnboardingAnswerOption.NAME]: {
    required: 'Organization name is required.',
  },
  [OnboardingAnswerOption.ROLE]: {
    required: 'Role is required.',
  },
  [OnboardingAnswerOption.CURRENT_PROVIDER]: {
    required: 'Current provider is required.',
  },
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: {
    required: 'Supported chains are required.',
  },
  [OnboardingAnswerOption.HEAR_ABOUT]: {
    required: 'How did you hear about us is required.',
  },
};
