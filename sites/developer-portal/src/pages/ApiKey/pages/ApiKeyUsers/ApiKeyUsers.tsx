import { useMemo, useState } from 'react';
import { ContentWrapper } from '../../components/ContentWrapper';
import { UsersTable } from './components/UsersTable';
import { UsersTabs, UsersTabValue } from './components/UsersTabs';
import { LoginMethod } from '../../../../types/loginMethod';

export const ApiKeyUsers = () => {
  const [tab, setTab] = useState<UsersTabValue>('all');

  const methods = useMemo((): LoginMethod[] | undefined => {
    switch (tab) {
      case 'all': {
        return undefined;
      }
      case 'pregen': {
        return ['PREGEN'];
      }
      case 'standard': {
        return [
          'GOOGLE',
          'DISCORD',
          'APPLE',
          'FACEBOOK',
          'TWITTER',
          'FARCASTER',
          'TELEGRAM',
          'EMAIL',
          'PHONE',
          'EXTERNAL_WALLET',
        ];
      }
    }
  }, [tab]);

  return (
    <ContentWrapper className="para:h-[calc(100vh-var(--appbar-height-mobile)-48px)] para:lg:h-[calc(100vh-var(--appbar-height)-48px)] para:min-h-[500px]">
      <UsersTabs value={tab} onChange={setTab} />
      <UsersTable methods={methods} />
    </ContentWrapper>
  );
};
