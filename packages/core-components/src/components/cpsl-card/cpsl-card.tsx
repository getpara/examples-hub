import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'cpsl-card',
  styleUrl: 'cpsl-card.scss',
  shadow: true,
})
export class CpslCard {
  render() {
    return (
      <Host>
        <div class={{ card: true }} part="card-container">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
