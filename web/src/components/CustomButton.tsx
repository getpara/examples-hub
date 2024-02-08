import React from 'react';

const CustomButton = ({ openPopup, webAuthURL, text }) => {
  // Styling for the button
  const buttonStyle = {
    marginTop: '68px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 15px',
    border: `2px solid`,
    borderRadius: '5px',
    cursor: 'pointer',
  };

  return (
    <button
      style={buttonStyle}
      onClick={() => openPopup(webAuthURL)}
    >
      <div style={{ marginRight: '8px' }}>{text}</div>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="none">
        <path d="M27 12.5V5H19.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 14L27 5" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 18V26C23 26.2652 22.8946 26.5196 22.7071 26.7071C22.5196 26.8946 22.2652 27 22 27H6C5.73478 27 5.48043 26.8946 5.29289 26.7071C5.10536 26.5196 5 26.2652 5 26V10C5 9.73478 5.10536 9.48043 5.29289 9.29289C5.48043 9.10536 5.73478 9 6 9H14" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};

export default CustomButton;
