import { CpslButton, CpslIcon } from '@getpara/react-components';

interface ExternalLinkButtonProps {
  link: string;
  text: string;
  size?: 'small' | 'medium';
}

export const ExternalLinkButton = ({ link, text, size = 'medium' }: ExternalLinkButtonProps) => {
  return (
    <CpslButton as="a" href={link} target="blank" variant="secondary" size={size}>
      {text}
      <CpslIcon slot="end" icon="linkExternal" />
    </CpslButton>
  );
};
