import { cn, ScrollArea, ScrollBar, Tabs, TabsList, TabsTrigger } from '@getpara/react-component-library';
import { Globe, User, Wand } from 'lucide-react';
import { ReactNode } from 'react';

export type UsersTabValue = 'all' | 'standard' | 'pregen';

export const USERS_TABS: { label: string; value: UsersTabValue; Icon: ReactNode }[] = [
  { label: 'All', value: 'all', Icon: <Globe /> },
  { label: 'Standard', value: 'standard', Icon: <User /> },
  { label: 'Pregen', value: 'pregen', Icon: <Wand /> },
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
      className={cn('para:gap-4', { 'para:gap-0': value === 'all' })}
    >
      <TabsList className="para:w-full">
        <ScrollArea className="para:w-full">
          <div className="para:flex">
            {USERS_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.Icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </div>
          <ScrollBar className="para:invisible" orientation="horizontal" />
        </ScrollArea>
      </TabsList>
    </Tabs>
  );
};
