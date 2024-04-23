import { ButtonIcon, Heading, Hero, Subheading } from './common';
import { CpslButton } from '@usecapsule/react-components';
import { IconType } from '@usecapsule/core-components';
import { useModalOutletContext } from '../hooks/useModalOutletContext';

interface ModalSuccessProps {
  heading: string;
  subHeading: string;
  icon: IconType;
}

export const ModalSuccess = ({
  heading,
  subHeading,
  icon,
}: ModalSuccessProps) => {
  const { partner } = useModalOutletContext();

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
