import { Button, ButtonProps, Spinner, Text } from '@chakra-ui/react';

interface ModalButtonProps extends ButtonProps {
  portalPrimaryButtonColor?: string;
  portalPrimaryButtonTextColor?: string;
  isFire: boolean;
}

export const ModalButton = ({
  portalPrimaryButtonColor,
  portalPrimaryButtonTextColor,
  isFire,
  isLoading,
  children,
  ...rest
}: ModalButtonProps) => {
  return (
    <Button
      bg={portalPrimaryButtonColor}
      fontSize="md"
      width="65%"
      alignSelf={'center'}
      fontFamily={isFire && 'Manrope'}
      {...rest}
    >
      {isLoading ? (
        <Spinner as="span" color={portalPrimaryButtonTextColor} />
      ) : (
        <Text color={portalPrimaryButtonTextColor}>{children}</Text>
      )}
    </Button>
  );
};
