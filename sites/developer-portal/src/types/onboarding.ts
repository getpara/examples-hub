import { Organization } from './api';

export enum QuestionType {
  TEXT = 'TEXT',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

export enum OnboardingAnswerOption {
  USER_NAME = 'userName',
  TELEGRAM = 'telegram',
  ROLE = 'role',
  CURRENT_PROVIDER = 'currentProvider',
  SUPPORTED_CHAINS = 'supportedChains',
  HEAR_ABOUT = 'hearAbout',
  NAME = 'name',
  HOMEPAGE_URL = 'homepageUrl',
}

export type OnboardingAnswers = {
  [OnboardingAnswerOption.USER_NAME]: string;
  [OnboardingAnswerOption.TELEGRAM]: string;
  [OnboardingAnswerOption.ROLE]: string;
  [OnboardingAnswerOption.CURRENT_PROVIDER]: string;
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: string[];
  [OnboardingAnswerOption.HEAR_ABOUT]: string;
} & Pick<Organization, 'name' | 'homepageUrl'>;
