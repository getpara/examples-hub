import styled from 'styled-components';
import { CodeBlock as ReactCodeBlock, github } from 'react-code-blocks';
import { CpslButton, CpslIcon } from '@getpara/react-components';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

interface CodeBlockProps {
  snippet: string;
}

const codeBlockTheme: Partial<{
  lineNumberColor: string;
  lineNumberBgColor: string;
  backgroundColor: string;
  textColor: string;
  substringColor: string;
  keywordColor: string;
  attributeColor: string;
  selectorAttributeColor: string;
  docTagColor: string;
  nameColor: string;
  builtInColor: string;
  literalColor: string;
  bulletColor: string;
  codeColor: string;
  additionColor: string;
  regexpColor: string;
  symbolColor: string;
  variableColor: string;
  templateVariableColor: string;
  linkColor: string;
  selectorClassColor: string;
  typeColor: string;
  stringColor: string;
  selectorIdColor: string;
  quoteColor: string;
  templateTagColor: string;
  deletionColor: string;
  titleColor: string;
  sectionColor: string;
  commentColor: string;
  metaKeywordColor: string;
  metaColor: string;
  functionColor: string;
  numberColor: string;
}> = {
  lineNumberColor: '#3C7DFF',
  lineNumberBgColor: 'transparent',
  backgroundColor: 'transparent',
  textColor: '#34A853',
  keywordColor: '#FB27FF',
  stringColor: '#FF754A',
  sectionColor: '#FFCB31',
  commentColor: '#34A853',
  functionColor: '#FFCB31',
};

export const CodeBlock = ({ snippet }: CodeBlockProps) => {
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopyCodeSnippetString = () => {
    if (snippet) {
      copy(snippet);
    }
  };

  return (
    <Container>
      <ReactCodeBlock
        text={snippet}
        language="javascript"
        theme={{ ...github, ...codeBlockTheme }}
        showLineNumbers={false}
        wrapLongLines
      />
      <CpslButton variant="ghost" onClick={handleCopyCodeSnippetString}>
        <CpslIcon icon={isCopied ? 'check' : 'copy'} />
      </CpslButton>
    </Container>
  );
};

const Container = styled.div`
  padding: 16px 12px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  border-radius: 16px;
  background: var(--cpsl-color-background-4);
  font-family: 'IBM Plex Mono';

  & span {
    font-size: 16px !important;
    line-height: 24px !important;
    user-select: auto !important;
    cursor: text;
  }
`;
