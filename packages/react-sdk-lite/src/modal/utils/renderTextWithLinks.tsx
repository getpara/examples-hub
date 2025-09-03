import { Fragment, ReactElement } from 'react';

// Render text with clickable links supporting [text](url) format
export const renderTextWithLinks = (text: string): ReactElement[] => {
  if (!text) return [<Fragment key={0}>{''}</Fragment>];

  const linkStyle = { color: 'inherit', textDecoration: 'underline', fontWeight: '500' };

  // Combined regex to match both markdown links and plain URLs
  const combinedRegex = /(\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(https?:\/\/[^\s]+)/g;

  const parts: ReactElement[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(<Fragment key={parts.length}>{text.slice(lastIndex, match.index)}</Fragment>);
    }

    // Handle markdown link [text](url)
    if (match[1]) {
      parts.push(
        <a key={parts.length} href={match[3]} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {match[2]}
        </a>,
      );
    }
    // Handle plain URL
    else if (match[4]) {
      parts.push(
        <a key={parts.length} href={match[4]} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {match[4]}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(<Fragment key={parts.length}>{text.slice(lastIndex)}</Fragment>);
  }

  // If no parts were added, return the original text
  return parts.length ? parts : [<Fragment key={0}>{text}</Fragment>];
};
