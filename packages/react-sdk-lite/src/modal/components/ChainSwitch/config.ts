import { Tab } from '../../types/commonTypes.js';

export enum TabValue {
  extension = 'extension',
  mobile = 'mobile',
  web = 'web',
}

export const TABS: Record<'extension' | 'mobile' | 'web', Tab<TabValue>> = {
  extension: { label: 'Extension', value: TabValue.extension, icon: 'puzzlePiece' },
  mobile: { label: 'Mobile', value: TabValue.mobile, icon: 'phone' },
  web: { label: 'Web', value: TabValue.web, icon: 'globe' },
};
