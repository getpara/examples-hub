import { Heading, Hero, Subheading } from './common';
import { IconType } from '@usecapsule/core-components';

interface ModalSuccessProps {
  heading: string;
  subHeading: string;
  icon: IconType;
}

export const ModalSuccess = ({ heading, subHeading, icon }: ModalSuccessProps) => {
  return (
    <>
      <Hero icon={icon} />
      <Heading>
        <span>{heading}</span>
      </Heading>
      <Subheading>
        <span>{subHeading}</span>
      </Subheading>
    </>
  );
};
