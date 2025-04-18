import { CodeBlock as ReactCodeBlock, github } from 'react-code-blocks';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Button } from '@getpara/react-component-library';
import { Check, Copy } from 'lucide-react';

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
    <div className="para:font-[IBM_Plex_Mono] para:flex para:gap-2 para:items-start para:rounded-sm para:bg-muted para:px-3 para:py-4 para:[&>span]:text-base para:[&>span]:leading-[24px] para:[&>span]:select-auto para:[&>span]:cursor-text para:[&>span]:flex-1">
      <ReactCodeBlock
        text={snippet}
        language="javascript"
        theme={{ ...github, ...codeBlockTheme }}
        showLineNumbers={false}
        wrapLongLines
      />
      <Button
        variant="ghost"
        className="para:h-auto para:p-0 para:has-[>svg]:px-0 para:[&_svg]:stroke-muted-foreground para:hover:[&_svg]:stroke-foreground"
        onClick={handleCopyCodeSnippetString}
      >
        {isCopied ? <Check className="para:size-6" /> : <Copy className="para:size-6" />}
      </Button>
    </div>
  );
};
