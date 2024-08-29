import { CpslButton, CpslIcon } from '@usecapsule/react-components';

interface DocsButtonProps {
  link: string;
  size?: 'small' | 'medium';
}

export const DocsButton = ({ link, size = 'medium' }: DocsButtonProps) => {
  return (
    <CpslButton as="a" href={link} target="blank" variant="secondary" size={size}>
      <CpslIcon slot="start" icon="file" />
      Docs
    </CpslButton>
  );
};
