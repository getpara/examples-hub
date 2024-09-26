import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';
import { CopyToModal } from './CopyToModal';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface CopyToProps {
  isInHeader?: boolean;
}

export const CopyTo = ({ isInHeader }: CopyToProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    formState: { isValid },
  } = useFormContext();

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <CopyButton
        size={isInHeader ? 'small' : 'medium'}
        fullWidth={!isInHeader}
        disabled={!isValid}
        variant="secondary"
        onClick={handleClick}
      >
        <CpslIcon icon="copy07" />
        Copy To
      </CopyButton>
      <CopyToModal open={isOpen} onClose={handleClose} />
    </>
  );
};

const CopyButton = styled(CpslButton)`
  &::part(button-native) {
    min-width: 140px;
  }
`;
