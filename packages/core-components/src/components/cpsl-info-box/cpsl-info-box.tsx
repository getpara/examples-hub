import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'cpsl-info-box',
  styleUrl: 'cpsl-info-box.scss',
  shadow: true,
})
export class CpslInfoBox {
  render() {
    return (
      <Host>
        <div class="info-box-container">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
