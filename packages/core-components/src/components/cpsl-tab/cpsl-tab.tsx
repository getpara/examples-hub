import { Component, Host, Prop, h, Event, EventEmitter, Listen, Element } from '@stencil/core';
import { TabClickEventDetail, TabSizeChangeEventDetail } from './tab-interface.js';
import { TabsChangedEventDetail } from '../cpsl-tabs/tabs-interface.js';

@Component({
  tag: 'cpsl-tab',
  styleUrl: 'cpsl-tab.scss',
  shadow: true,
})
export class CpslTab {
  @Element() el!: HTMLCpslTabElement;

  /**
   * The selected tab component
   */
  @Prop() selected = false;

  /**
   * A tab id must be provided for each `cpsl-tab`. It's used internally to reference
   * the selected tab or by the router to switch between them.
   */
  @Prop() tab: string;

  /**
   * Emitted when tabs are clicked
   * @internal
   */
  @Event() cpslTabButtonClick!: EventEmitter<TabClickEventDetail>;

  /**
   * Emitted when tab size changes
   * @internal
   */
  @Event() cpslTabButtonSizeChange!: EventEmitter<TabSizeChangeEventDetail>;

  @Listen('cpslTabsChanged', { target: 'window' })
  onTabsChanged(ev: CustomEvent<TabsChangedEventDetail>) {
    this.setSelected(ev);
  }

  @Listen('cpslTabsInit', { target: 'window' })
  onTabsInit(ev: CustomEvent<TabsChangedEventDetail>) {
    this.setSelected(ev);
  }

  componentDidLoad() {
    new MutationObserver(() => {
      this.cpslTabButtonSizeChange.emit({ tab: this.tab });
    }).observe(this.el, {
      attributes: true,
    });
  }

  private setSelected(ev: CustomEvent<TabsChangedEventDetail>) {
    const dispatchedFrom = ev.target as HTMLElement;
    const parent = this.el.parentElement as EventTarget;

    if (ev.composedPath().includes(parent) || dispatchedFrom?.contains(this.el)) {
      this.selected = this.tab === ev.detail.tab;
    }
  }

  private onTabClicked = () => {
    this.cpslTabButtonClick.emit({ tab: this.tab, selected: this.selected });
  };

  render() {
    return (
      <Host class={{ selected: this.selected }} onClick={this.onTabClicked}>
        <div class={{ 'tab-container': true }}>
          <slot name="start"></slot>
          <div class="content">
            <slot></slot>
          </div>
          <slot name="end"></slot>
        </div>
      </Host>
    );
  }
}
