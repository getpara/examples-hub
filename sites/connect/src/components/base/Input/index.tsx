import React from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import * as Styled from './styles';
import toast from 'react-hot-toast';

interface InputProps {
  width?: number;
  disabled?: boolean;
  truncateAddress?: boolean;
  isAddressHidden?: boolean;
  showVisibility?: boolean;
  walletAddress?: string | null;
  fullAddress?: string | null;
  value?: string;
  copiedText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVisibilityClick?: () => void;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  width = 342,
  disabled = false,
  walletAddress = null,
  fullAddress = null,
  truncateAddress = true,
  isAddressHidden,
  showVisibility,
  value,
  copiedText,
  onChange,
  onVisibilityClick,
  placeholder,
  ...rest
}) => {
  const displayAddress = walletAddress
    ? truncateAddress
      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 6)}`
      : walletAddress
    : '';

  return walletAddress ? (
    <Styled.InputContainer>
      <Styled.AddressText>{showVisibility && isAddressHidden ? '••••••••••••••••' : displayAddress}</Styled.AddressText>
      {showVisibility && (
        <Styled.VisibilityContainer onClick={onVisibilityClick}>
          {isAddressHidden ? <Visibility /> : <VisibilityOff />}
        </Styled.VisibilityContainer>
      )}
      <Styled.Copybutton
        onClick={() => {
          toast.success(copiedText ?? 'Address Copied!');
          if (fullAddress) {
            navigator.clipboard.writeText(fullAddress);
          }
        }}
      >
        <ContentCopyIcon />
      </Styled.Copybutton>
    </Styled.InputContainer>
  ) : (
    <Styled.CustomInput
      {...rest}
      value={value}
      onChange={onChange}
      width={width}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
};

export default Input;
