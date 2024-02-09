import React from 'react';
import './copy-button.css'; // Make sure to create this CSS file in the same directory

interface CopyButtonProps {
  onCopy: () => void;
  copyStatus: string;
  copyButtonDisabled: boolean;
  backgroundColor?: string;
  textColor?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  onCopy,
  copyStatus,
  copyButtonDisabled,
  backgroundColor,
  textColor,
}) => {
  return (
    <button
      disabled={copyButtonDisabled}
      className="copy-button"
      onClick={onCopy}
      style={{
        backgroundColor,
        color: textColor ?? undefined,
      }}
    >
      <span role="img" aria-label="clipboard">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"></path>
        </svg>
      </span>{' '}
      {copyStatus ?? 'Copy'}
    </button>
  );
};

export default CopyButton;
