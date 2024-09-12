import { Component, Host, Element, h } from '@stencil/core';

@Component({
  tag: 'cpsl-nav-button-group',
  styleUrl: 'cpsl-nav-button-group.scss',
  shadow: true,
})
export class CpslNavButtonGroup {
  @Element() el!: HTMLCpslNavButtonGroupElement;

  componentWillRender() {
    if (this.otherSlots?.length) {
      console.error('cpsl-button is the only valid child of cpsl-nav-button-group');
      this.otherSlots.forEach(item => item.remove());
    }
  }

  private get otherSlots() {
    return this.el.querySelectorAll('&> *:not(cpsl-nav-button)');
  }
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
