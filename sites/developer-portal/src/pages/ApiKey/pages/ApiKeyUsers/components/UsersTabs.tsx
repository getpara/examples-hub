import { Tabs, TabsList, TabsTrigger } from '@getpara/react-component-library';
import { Globe, User, Wand } from 'lucide-react';
import { ReactNode } from 'react';
import clsx from 'clsx';

export type UsersTabValue = 'all' | 'standard' | 'pregen';

export const ASSET_TABS: { label: string; value: UsersTabValue; Icon: ReactNode }[] = [
  { label: 'All Users', value: 'all', Icon: <Globe /> },
  { label: 'Standard Users', value: 'standard', Icon: <User /> },
  { label: 'Pregen Users', value: 'pregen', Icon: <Wand /> },
];

type UsersTabsProps = {
  value: UsersTabValue;
  onChange: (_: UsersTabValue) => void;
};

export const UsersTabs = ({ value, onChange }: UsersTabsProps) => {
  return (
    <Tabs
      value={value}
      onValueChange={val => onChange(val as UsersTabValue)}
      className={clsx('para:gap-4', { 'para:gap-0': value === 'all' })}
    >
      <TabsList className="para:w-full">
        {ASSET_TABS.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.Icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
