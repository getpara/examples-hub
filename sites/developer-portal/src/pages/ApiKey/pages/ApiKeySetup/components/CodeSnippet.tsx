import {
  cn,
  ScrollArea,
  ScrollBar,
  Tabs,
  TabsList,
  TabsTrigger,
  Typography,
  useFormContext,
} from '@getpara/react-component-library';
import { SetupForm } from '../hooks/useSetupForm';
import { getFrameworkCodeSnippet, getFrameworkVersions } from '../../../../../utils/framework';
import { Framework } from '../../../../../types/framework';
import { CodeBlock } from '../../../../../components/CodeBlock/CodeBlock';
import { useEffect, useState } from 'react';

export const CodeSnippet = () => {
  const [tab, setTab] = useState('');
  const form = useFormContext<SetupForm>();

  const [framework] = form.watch(['framework', 'packageManager']);

  const typedFramework = (framework as Framework) ?? Framework.REACT;

  const versions = getFrameworkVersions(typedFramework);
  const codeSnippet = getFrameworkCodeSnippet(typedFramework, tab);

  useEffect(() => {
    setTab(versions?.[0]?.value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedFramework]);

  if (!codeSnippet) {
    return null;
  }

  return (
    <div className="para:flex para:flex-col para:gap-4">
      <div>
        <Typography className="para:text-sm para:font-semibold">Copy and Paste Code Snippet</Typography>
        <Typography color="secondary" className="para:text-sm para:font-medium">
          After you add this code, run your project to confirm that it is working correctly.
          {(versions?.length ?? 1) > 1 && (
            <>
              <br />
              Make sure to select the version of the SDK that you are using to receive the correct snippet.
            </>
          )}
        </Typography>
      </div>
      {versions && (
        <Tabs value={tab} onValueChange={setTab} className={cn('para:gap-4')}>
          <TabsList className="para:w-full">
            <ScrollArea className="para:w-full">
              <div className="para:flex">
                {versions.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar className="para:invisible" orientation="horizontal" />
            </ScrollArea>
          </TabsList>
        </Tabs>
      )}
      <CodeBlock snippet={codeSnippet} />
    </div>
  );
};
