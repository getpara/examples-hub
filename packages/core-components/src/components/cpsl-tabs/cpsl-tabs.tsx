import { Component, Host, Element, h, Event, Prop, EventEmitter, State, Watch } from '@stencil/core';
import { TabClickEventDetail } from '../cpsl-tab/tab-interface';
import { TabsChangedEventDetail } from './tabs-interface';

@Component({
  tag: 'cpsl-tabs',
  styleUrl: 'cpsl-tabs.scss',
  shadow: true,
})
export class CpslTabs {
  @Element() el!: HTMLCpslTabsElement;

  @State() selectedTabRect?: DOMRect;
  @State() loaded: boolean = false;

  /**
   * Whether or not the tabs take the full width of their container.
   */
  @Prop() fullWidth?: boolean;

  /**
   * The selected tab component
   */
  @Prop() selectedTab?: string;

  /**
   * Emitted when a tab is changed
   */
  @Event() cpslTabsChanged!: EventEmitter<TabsChangedEventDetail>;

  /**
   * Emitted when tabs are initialized
   * @internal
   */
  @Event() cpslTabsInit!: EventEmitter<TabsChangedEventDetail>;

  @Watch('fullWidth')
  updateSlider() {
    // Allow component to condense or expand before recalculating silder
    setTimeout(() => {
      this.selectedTabRect = getTab(this.tabs, this.selectedTab).getBoundingClientRect();
    }, 50);
  }

  @Watch('selectedTab')
  updateTab(newValue?: string, oldValue?: string) {
    if (Boolean(newValue) && !Boolean(oldValue)) {
      this.selectedTabRect = getTab(this.tabs, this.selectedTab).getBoundingClientRect();
    }
  }

  componentWillLoad() {
    this.selectedTabRect = getTab(this.tabs, this.selectedTab)?.getBoundingClientRect() ?? ({ width: 0, x: 0 } as DOMRect);

    this.cpslTabsInit.emit({
      tab: this.selectedTab,
    });
  }

  componentDidLoad() {
    this.selectedTabRect = getTab(this.tabs, this.selectedTab)?.getBoundingClientRect() ?? ({ width: 0, x: 0 } as DOMRect);

    // Allow slider to be rendered with the correct initial style before the transition is added
    setTimeout(() => {
      this.loaded = true;
    }, 50);
  }

  private get tabs() {
    return Array.from(this.el.querySelectorAll('cpsl-tab'));
  }

  private onTabClicked = (ev: CustomEvent<TabClickEventDetail>) => {
    const { tab } = ev.detail;

    if (tab !== this.selectedTab) {
      this.selectedTabRect = getTab(this.tabs, tab).getBoundingClientRect();

      this.cpslTabsChanged.emit({
        tab,
      });
    }
  };

  render() {
    const tabsPosition = this.el.getBoundingClientRect();
    // Get border width as a number
    const tabsBorderWidth = +getComputedStyle(this.el).getPropertyValue('--tabs-border-width').slice(0, -2);
    const selectedTabRect = this.selectedTabRect;

    return (
      <Host class={{ 'full-width': this.fullWidth }} onCpslTabButtonClick={this.onTabClicked}>
        <div class="tabs-container">
          <slot></slot>
          <div
            class={{ slider: true, loaded: this.loaded }}
            style={{
              width: `${selectedTabRect.width}px`,
              left: `${selectedTabRect.x - tabsPosition.x - tabsBorderWidth * 2}px`,
            }}
          />
        </div>
      </Host>
    );
  }
}

const getTab = (tabs: HTMLCpslTabElement[], tab: string | HTMLCpslTabElement): HTMLCpslTabElement | undefined => {
  const tabEl = typeof tab === 'string' ? tabs.find(t => t.tab === tab) : tab;

  return tabEl;
};
