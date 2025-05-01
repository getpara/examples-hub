import { ScrollArea, ScrollBar, Tabs, TabsContent, TabsList, TabsTrigger } from '@getpara/react-component-library';
import { Globe, Settings2 } from 'lucide-react';
import { ReactNode } from 'react';
import clsx from 'clsx';

type AssetTabValue = 'all' | 'custom';

export const ASSET_TABS: { label: string; value: AssetTabValue; Icon: ReactNode }[] = [
  { label: 'All Available Assets', value: 'all', Icon: <Globe /> },
  { label: 'Custom Selection', value: 'custom', Icon: <Settings2 /> },
];

type AssetTabsProps = {
  disabled?: boolean;
  value: AssetTabValue;
  CustomContent: ReactNode;
  onChange: (_: AssetTabValue) => void;
};

export const AssetTabs = ({ disabled, value, CustomContent, onChange }: AssetTabsProps) => {
  return (
    <Tabs
      value={value}
      onValueChange={val => onChange(val as AssetTabValue)}
      className={clsx('para:gap-4', { 'para:gap-0': value === 'all' })}
    >
      <TabsList className="para:w-full">
        <ScrollArea className="para:w-full">
          <div className="para:flex">
            {ASSET_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} disabled={disabled}>
                {tab.Icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </div>
          <ScrollBar className="para:invisible" orientation="horizontal" />
        </ScrollArea>
      </TabsList>
      {ASSET_TABS.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.value === 'all' ? null : CustomContent}
        </TabsContent>
      ))}
    </Tabs>
  );
};
