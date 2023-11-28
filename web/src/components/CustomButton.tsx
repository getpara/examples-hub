import React from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const CustomButton = ({ openPopup, webAuthURL, text }) => {
  // Styling for the button
  const buttonStyle = {
    marginTop: '68px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 15px',
    backgroundColor: 'white',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const iconStyle = {
    marginLeft: '8px',
  };

  return (
    <button
      style={buttonStyle}
      onClick={() => openPopup(webAuthURL)}
    >
      {text}
      <ExternalLinkIcon style={iconStyle} />
    </button>
  );
};

export default CustomButton;
