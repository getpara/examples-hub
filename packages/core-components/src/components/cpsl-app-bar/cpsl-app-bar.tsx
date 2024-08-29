import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-app-bar',
  styleUrl: 'cpsl-app-bar.scss',
  shadow: true,
})
export class CpslAppBar {
  /**
   * Height of the app bar.
   */
  @Prop() height: number;

  /**
   * The position of the drawer.
   * Default is `fixed`.
   */
  @Prop() position?: 'fixed' | 'static' = 'fixed';

  /**
   * Override z-index.
   */
  @Prop() zIndexOverride?: number;

  render() {
    return (
      <Host
        style={{
          // position: this.position,
          height: `${this.height}px`,
          ...(this.zIndexOverride ? { zIndex: `${this.zIndexOverride}` } : {}),
        }}
      >
        <div
          class="container"
          part="container"
          style={{
            position: this.position,
            height: `${this.height}px`,
          }}
        >
          <slot></slot>
        </div>
        {this.position === 'fixed' && (
          <div
            style={{
              height: `${this.height}px`,
            }}
          />
        )}
      </Host>
    );
  }
}
