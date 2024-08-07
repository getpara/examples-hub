import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'cpsl-row',
  styleUrl: 'cpsl-row.scss',
  shadow: true,
})
export class CpslRow {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
