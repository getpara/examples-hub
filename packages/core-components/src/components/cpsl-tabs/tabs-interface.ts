export interface TabsCustomEvent extends CustomEvent {
  detail: { tab: string };
  target: HTMLCpslTabsElement;
}

export interface TabsChangedEventDetail {
  tab?: string;
}
