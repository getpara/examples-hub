import { Organization } from './api';

export enum QuestionType {
  TEXT = 'TEXT',
  SELECT = 'SELECT',
}

export enum OnboardingAnswerOption {
  USER_NAME = 'userName',
  TELEGRAM = 'telegram',
  ROLE = 'role',
  USE_CAPSULE = 'useCapsule',
  STAGE = 'stage',
  CURRENT_PROVIDER = 'currentProvider',
  SUPPORTED_CHAINS = 'supportedChains',
  TEAM_SIZE = 'teamSize',
  HEAR_ABOUT = 'hearAbout',
  NAME = 'name',
  HOMEPAGE_URL = 'homepageUrl',
}

export type OnboardingAnswers = {
  [OnboardingAnswerOption.USER_NAME]: string;
  [OnboardingAnswerOption.TELEGRAM]: string;
  [OnboardingAnswerOption.ROLE]: string;
  [OnboardingAnswerOption.USE_CAPSULE]: string;
  [OnboardingAnswerOption.STAGE]: string;
  [OnboardingAnswerOption.CURRENT_PROVIDER]: string;
  [OnboardingAnswerOption.SUPPORTED_CHAINS]: string[];
  [OnboardingAnswerOption.TEAM_SIZE]: string;
  [OnboardingAnswerOption.HEAR_ABOUT]: string;
} & Pick<Organization, 'name' | 'homepageUrl'>;
