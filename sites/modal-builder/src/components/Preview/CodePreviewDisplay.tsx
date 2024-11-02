import React, { useEffect, useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { codeToHtml } from 'shiki';
import { Text } from '../UI';
import { useAtom } from 'jotai';
import { getCodeStringAtom } from '../../atoms';

interface CodePreviewDisplayProps {}

export const CodePreviewDisplay: React.FC<CodePreviewDisplayProps> = () => {
  const [getCodeString] = useAtom(getCodeStringAtom);

  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const highlight = async () => {
      try {
        const code = getCodeString;
        const html = await codeToHtml(code, {
          lang: 'tsx',
          theme: 'github-light',
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('Error highlighting code:', error);
      }
    };

    highlight();
  }, [getCodeString]);

  const handleCopy = useCallback(() => {
    const code = getCodeString;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopyButtonText('Copied');
        setIsCopied(true);
        setTimeout(() => {
          setCopyButtonText('Copy Code');
          setIsCopied(false);
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  }, [getCodeString]);

  return (
    <Wrapper>
      <Container>
        <StyledCode dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        <CopyButton onClick={handleCopy} $isCopied={isCopied}>
          <CpslIcon icon="copy" />
          <Text variant="bodyS" color="primary" weight="medium">
            {copyButtonText}
          </Text>
        </CopyButton>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  height: 100%;
  padding: 1rem;
`;

const Container = styled.div`
  width: 100%;
  background-color: white;
  border-radius: 1rem;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  position: relative;
  box-shadow: 0 0.25rem 6px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
`;

const StyledCode = styled.div`
  .shiki {
    background-color: transparent !important;
    margin: 0;
    padding: 1rem 3rem 1rem 4rem;
    white-space: pre-wrap;
    word-break: break-word;
    counter-reset: line;
  }

  .shiki .line {
    position: relative;
    counter-increment: line;
  }

  .shiki .line::before {
    content: counter(line);
    position: absolute;
    left: -3rem;
    width: 2rem;
    text-align: right;
    color: #858585;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
`;

const CopyButton = styled.button<{ $isCopied: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s,
    background-color 0.2s,
    width 0.3s ease-in-out;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
  overflow: hidden;

  ${Container}:hover & {
    opacity: 1;
  }

  &:hover {
    background-color: #e0e0e0;
  }

  cpsl-icon {
    color: #858585;
    margin-right: 0.25rem;
    --width: 1rem;
    --height: 1rem;
    flex-shrink: 0;
  }

  ${props =>
    props.$isCopied &&
    css`
      animation: ${pulseAnimation} 0.3s ease-in-out;
      background-color: #e0e0e0;
    `}
`;
