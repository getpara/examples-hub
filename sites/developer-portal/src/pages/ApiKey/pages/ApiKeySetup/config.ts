import { FileText, LucideIcon, PaintbrushVertical } from 'lucide-react';
import { MODAL_CONFIG_LINK, MODAL_DESIGNER_LINK } from '../../../../utils/constants';

export type OnboardingStepButton = {
  Icon?: LucideIcon;
  text: string;
  to: string;
  target?: string;
  isExternal?: boolean;
};

export type OnboardingStep = {
  step: string;
  title: string;
  body: string;
  primaryButton?: OnboardingStepButton;
  secondaryButton?: OnboardingStepButton;
};

export const ONBOARDING_VERSION = 1;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    step: 'First: Create a user',
    title: 'Creating A User',
    body: 'Use the code snippets provided to install and run your project. When it is up and running, create a user by logging in with the Para modal. When a user is successfully created, you’ll see it here and know that everything is working!',
  },
  {
    step: 'Next: Style your modal',
    title: 'Modal Styling',
    body: 'Styling your modal ultimately happens in your code, but you can use our Modal Designer to preview your modal’s design and then copy the code snippet into your project.',
    primaryButton: {
      text: 'Modal Builder',
      to: MODAL_DESIGNER_LINK,
      Icon: PaintbrushVertical,
      target: '_blank',
      isExternal: true,
    },
    secondaryButton: {
      text: 'Styling Guide',
      to: MODAL_CONFIG_LINK,
      Icon: FileText,
      target: '_blank',
      isExternal: true,
    },
  },
  {
    step: 'Next: Brand the experience',
    title: 'Branding',
    body: 'In addition to styling your modal, your logo, name, and brand elements show up across emails, login portals, and more. Make sure your brand comes looks great everywhere!',
    primaryButton: {
      text: 'Configure Brand',
      to: '/branding',
      isExternal: false,
    },
    secondaryButton: {
      text: 'Brand Guide',
      to: MODAL_CONFIG_LINK,
      Icon: FileText,
      target: '_blank',
      isExternal: true,
    },
  },
  {
    step: 'Next: Explore features',
    title: 'Explore Para’s Features',
    body: 'Everything is good to go! Now its time to fine tune the experience for your project. Use the left hand nav to find and adjust your security settings, on & off ramps, and more!',
    primaryButton: {
      text: 'Security Settings',
      to: '/security',
      isExternal: false,
    },
    secondaryButton: {
      text: 'Customize Para',
      to: MODAL_CONFIG_LINK,
      Icon: FileText,
      target: '_blank',
      isExternal: true,
    },
  },
];
