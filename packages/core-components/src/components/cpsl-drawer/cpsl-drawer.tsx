import { Component, Host, Prop, Element, h, State } from '@stencil/core';
import { DEFAULT_Z_INDICES } from '../../constants.js';

@Component({
  tag: 'cpsl-drawer',
  styleUrl: 'cpsl-drawer.scss',
  shadow: true,
})
export class CpslDrawer {
  @Element() el!: HTMLCpslDrawerElement;

  @State() closedAnchorPosition?: string;
  @State() showTransition: boolean;

  /**
   * Side from which the drawer will enter from.
   */
  @Prop() anchor: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Starting anchor position.
   */
  @Prop() anchorPosition?: number;

  /**
   * Hides the overlay for temporary drawers.
   */
  @Prop() noOverlay?: boolean;

  /**
   * Whether the drawer is open or not.
   */
  @Prop() open: boolean;

  /**
   * Size (height or width) of the drawer.
   */
  @Prop() size: number | 'auto';

  /**
   * Duration in seconds of the open/close animation.
   * Default is 0.15.
   */
  @Prop() transitionDuration?: number = 0.15;

  /**
   * Transition timing function to use.
   * Default is ease-in-out.
   */
  @Prop() transitionFunction?: string = 'ease-in-out';

  /**
   * The variant of the drawer.
   * `temporary` drawers will cover content and contain a backdrop. `permanent` drawers will sit beside content, i.e. desktop navigation.
   * Default is `temporary`.
   */
  @Prop() variant?: 'temporary' | 'permanent' = 'temporary';

  /**
   * Override z-index.
   */
  @Prop() zIndexOverride?: number;

  componentDidLoad() {
    this.closedAnchorPosition = `-${this.getContainerHeight()}px`;
    // Show transition after initial render
    setTimeout(() => {
      this.showTransition = true;
    }, 100);
  }

  private getContainerHeight() {
    return this.containerEl?.clientHeight;
  }

  private get containerEl() {
    return this.el.shadowRoot.getElementById('container');
  }

  render() {
    const setHeight = this.anchor === 'top' || this.anchor === 'bottom';
    const startingAnchor = `${this.anchorPosition}px` ?? '0px';
    const size = this.size === 'auto' ? 'auto' : `${this.size}px`;

    return (
      <Host
        style={{
          width: setHeight ? '100vw' : size,
          height: setHeight ? size : '100vh',
          transitionDuration: `${this.showTransition ? this.transitionDuration : 0}s`,
          transitionTimingFunction: `${this.transitionFunction}`,
          [this.anchor]: this.open || this.variant === 'permanent' ? startingAnchor : this.closedAnchorPosition,
          opacity: this.closedAnchorPosition === undefined ? '0' : '1',
          ...(this.zIndexOverride ? { zIndex: `${this.zIndexOverride}` } : {}),
        }}
        class={{
          top: this.anchor === 'top',
          bottom: this.anchor === 'bottom',
          left: this.anchor === 'left',
          right: this.anchor === 'right',
        }}
      >
        {this.variant === 'temporary' && !this.noOverlay && <cpsl-overlay open={this.open} zIndexOverride={DEFAULT_Z_INDICES.modal + 1} />}
        <div id="container" class="container" part="container">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
