import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'cpsl-divider',
  styleUrl: 'cpsl-divider.scss',
  shadow: true,
})
export class CpslDivider {
  render() {
    return (
      <Host>
        <div />
        <slot></slot>
        <div />
      </Host>
    );
  }
}
