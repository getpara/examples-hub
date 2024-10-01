import { CpslButton, CpslIcon } from '@usecapsule/react-components';

interface LearnMoreButtonProps {
  link: string;
  size?: 'small' | 'medium';
}

export const LearnMoreButton = ({ link, size = 'medium' }: LearnMoreButtonProps) => {
  return (
    <CpslButton as="a" href={link} target="blank" variant="secondary" size={size}>
      Learn More
      <CpslIcon slot="end" icon="arrowNarrow" />
    </CpslButton>
  );
};
