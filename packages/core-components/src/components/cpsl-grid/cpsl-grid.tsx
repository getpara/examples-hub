import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-grid',
  styleUrl: 'cpsl-grid.scss',
  shadow: true,
})
export class CpslGrid {
  /**
   * If `true`, the grid will have a fixed width based on the screen size.
   */
  @Prop() fixed = false;

  render() {
    return (
      <Host
        class={{
          'grid-fixed': this.fixed,
        }}
      >
        <slot></slot>
      </Host>
    );
  }
}
