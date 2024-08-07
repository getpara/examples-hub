import { Component, Host, Prop, h, Element, Watch } from '@stencil/core';
import gsap from 'gsap';

@Component({
  tag: 'cpsl-overlay',
  styleUrl: 'cpsl-overlay.scss',
  shadow: true,
})
export class CpslOverlay {
  @Element() el!: HTMLCpslOverlayElement;

  /**
   * Duration in seconds of the fade out animation.
   * Default is .5.
   */
  @Prop() enterTransitionDuration?: number = 0.5;

  /**
   * Duration in seconds of the fade out animation.
   * Default is .5.
   */
  @Prop() exitTransitionDuration?: number = 0.5;

  /**
   * Whether or not to show the overlay.
   */
  @Prop() open: boolean;

  /**
   * Override z-index.
   */
  @Prop() zIndexOverride?: number;

  @Watch('open')
  toggleHeight() {
    this.open
      ? gsap.timeline({ defaults: { duration: this.enterTransitionDuration } }).to(this.el, { display: 'block', opacity: 1 })
      : gsap.timeline({ defaults: { duration: this.exitTransitionDuration } }).to(this.el, { display: 'none', opacity: 0 });

    if (this.open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Setting a timeout here to prevent modal from shifting when the scroll bar appears
      setTimeout(() => {
        document.documentElement.style.overflow = 'auto';
      }, this.exitTransitionDuration * 1000);
    }
  }

  componentDidLoad() {
    if (this.open) {
      gsap.timeline({ defaults: { duration: this.enterTransitionDuration } }).to(this.el, { display: 'block', opacity: 1 });
      document.documentElement.style.overflow = 'hidden';
    }
  }

  render() {
    return (
      <Host style={Boolean(this.zIndexOverride) ? { zIndex: `${this.zIndexOverride}` } : {}}>
        <slot></slot>
      </Host>
    );
  }
}
