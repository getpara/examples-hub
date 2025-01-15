import { RegisterOptions } from 'react-hook-form';
import { OnboardingAnswerOption, OnboardingAnswers, QuestionType } from '../../../types/onboarding';
import { HTTPS_URL_REGEX } from '../../../utils/regex';

export const aboutYouQuestions = [
  OnboardingAnswerOption.USER_NAME,
  OnboardingAnswerOption.TELEGRAM,
  OnboardingAnswerOption.ROLE,
  OnboardingAnswerOption.HOMEPAGE_URL,
];

export const aboutProjectQuestions = [
  OnboardingAnswerOption.USE_CAPSULE,
  OnboardingAnswerOption.STAGE,
  OnboardingAnswerOption.CURRENT_PROVIDER,
  OnboardingAnswerOption.SUPPORTED_CHAINS,
  OnboardingAnswerOption.TEAM_SIZE,
  OnboardingAnswerOption.HEAR_ABOUT,
];

export const orgQuestions = [OnboardingAnswerOption.NAME];

export const selectQuestionOptions: Record<string, string[]> = {
  [OnboardingAnswerOption.USE_CAPSULE]: [
    'At my company',
    'For a personal project',
    'At a hackathon',
    'I’m just looking around',
  ],
  [OnboardingAnswerOption.STAGE]: [
    'Just an idea',
    'Getting ready to launch',
    'We have users',
    'We are growing',
    'We’ve been around',
  ],
  [OnboardingAnswerOption.CURRENT_PROVIDER]: ['No', 'Yes'],
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: ['Ethereum / EVM', 'Solana', 'Cosmos', 'Other'],
  [OnboardingAnswerOption.TEAM_SIZE]: ['Just me', '2-5', '5-20', '20-100', '100+'],
  [OnboardingAnswerOption.HEAR_ABOUT]: ['Word of mouth', 'Twitter', 'Google', 'Youtube', 'Conference', 'Other'],
};

export const questionType: Record<string, QuestionType> = {
  [OnboardingAnswerOption.USER_NAME]: QuestionType.TEXT,
  [OnboardingAnswerOption.TELEGRAM]: QuestionType.TEXT,
  [OnboardingAnswerOption.NAME]: QuestionType.TEXT,
  [OnboardingAnswerOption.ROLE]: QuestionType.TEXT,
  [OnboardingAnswerOption.HOMEPAGE_URL]: QuestionType.TEXT,
  [OnboardingAnswerOption.USE_CAPSULE]: QuestionType.SELECT,
  [OnboardingAnswerOption.STAGE]: QuestionType.SELECT,
  [OnboardingAnswerOption.CURRENT_PROVIDER]: QuestionType.SELECT,
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: QuestionType.SELECT,
  [OnboardingAnswerOption.TEAM_SIZE]: QuestionType.SELECT,
  [OnboardingAnswerOption.HEAR_ABOUT]: QuestionType.SELECT,
};

export const questionIsMultipleSelect: Record<string, boolean> = {
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: true,
};

export const questionLabel: Record<string, string> = {
  [OnboardingAnswerOption.USER_NAME]: 'Name',
  [OnboardingAnswerOption.TELEGRAM]: 'Telegram Handle',
  [OnboardingAnswerOption.NAME]: 'Name your Capsule organization',
  [OnboardingAnswerOption.ROLE]: 'Role',
  [OnboardingAnswerOption.HOMEPAGE_URL]: 'Website URL',
  [OnboardingAnswerOption.USE_CAPSULE]: 'How will you use Capsule?',
  [OnboardingAnswerOption.STAGE]: 'What stage is your project?',
  [OnboardingAnswerOption.CURRENT_PROVIDER]: 'Are you already using an embedded wallet provider?',
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: 'What chains does your app support?',
  [OnboardingAnswerOption.TEAM_SIZE]: 'How big is your team?',
  [OnboardingAnswerOption.HEAR_ABOUT]: 'How did you hear about us?',
};

export const questionPlaceholder: Record<string, string> = {
  [OnboardingAnswerOption.USER_NAME]: 'Enter name',
  [OnboardingAnswerOption.TELEGRAM]: 'Enter Telegram handle',
  [OnboardingAnswerOption.NAME]: 'Name your organization',
  [OnboardingAnswerOption.ROLE]: 'Enter role',
  [OnboardingAnswerOption.HOMEPAGE_URL]: 'Link to your project or company',
  [OnboardingAnswerOption.USE_CAPSULE]: 'Choose one',
  [OnboardingAnswerOption.STAGE]: 'Choose one',
  [OnboardingAnswerOption.CURRENT_PROVIDER]: 'Choose one',
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: 'Choose one or more',
  [OnboardingAnswerOption.TEAM_SIZE]: 'Choose one',
  [OnboardingAnswerOption.HEAR_ABOUT]: 'Choose one',
};

export const questionRules: Record<
  string,
  Omit<RegisterOptions<OnboardingAnswers, any>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
> = {
  [OnboardingAnswerOption.HOMEPAGE_URL]: {
    required: 'Website URL is required.',
    pattern: {
      value: HTTPS_URL_REGEX,
      message: 'Must be a secure (https) url.',
    },
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
  [OnboardingAnswerOption.USE_CAPSULE]: {
    required: 'How will you use Capsule is required.',
  },
  [OnboardingAnswerOption.STAGE]: {
    required: 'Stage is required.',
  },
  [OnboardingAnswerOption.CURRENT_PROVIDER]: {
    required: 'Current provider is required.',
  },
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: {
    required: 'Supported chains are required.',
  },
  [OnboardingAnswerOption.TEAM_SIZE]: {
    required: 'Team size is required.',
  },
  [OnboardingAnswerOption.HEAR_ABOUT]: {
    required: 'How did you hear about us is required.',
  },
};
