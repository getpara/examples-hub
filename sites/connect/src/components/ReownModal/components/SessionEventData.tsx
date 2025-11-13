import { ScrollArea, ScrollBar, Separator } from '@getpara/react-component-library';
import { Section } from './Section';
import ModalStore from '../../../store/ModalStore';
import { useSnapshot } from 'valtio';
import { SignClientTypes } from '@walletconnect/types';
import { getSignTypedDataParamsData } from '../../../utils/HelperUtil';
import { CodeBlock, github } from 'react-code-blocks';

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
  lineNumberBgColor: 'transparent',
  backgroundColor: 'transparent',
  textColor: '#2A9D90',
  stringColor: '#E76E50',
  numberColor: '#E8C468',
};

export const SessionEventData = () => {
  const { data } = useSnapshot(ModalStore.state);

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];

  if (!event) return null;

  // Get data
  const signData = getSignTypedDataParamsData(event.params.request.params);

  return (
    <>
      <Section label="Data">
        <ScrollArea className="para:p-2 para:rounded para:bg-muted para:border para:border-border para:w-full para:text-xs para:font-[DM_Mono] para:max-h-[50dvh] para:overflow-y-auto para:overflow-x-hidden">
          <CodeBlock
            text={JSON.stringify(signData, null, 1)}
            language="json"
            showLineNumbers={false}
            theme={{ ...github, ...codeBlockTheme }}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Section>
      <Separator />
    </>
  );
};
