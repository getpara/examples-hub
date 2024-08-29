import { Component, Host, Prop, Watch, Element, Event, h, EventEmitter } from '@stencil/core';

@Component({
  tag: 'cpsl-modal-v2',
  styleUrl: 'cpsl-modal-v2.scss',
  shadow: true,
})
export class CpslModalV2 {
  @Element() el!: HTMLCpslModalV2Element;

  /**
   * Duration in seconds of the modal entering.
   * Default is .15.
   */
  @Prop() enterTransitionDuration?: number = 0.15;

  /**
   * Duration in seconds of the modal exiting.
   * Default is .15.
   */
  @Prop() exitTransitionDuration?: number = 0.15;

  /**
   * Whether or not to show the modal with a box shadow.
   */
  @Prop() elevated: boolean;

  /**
   * Whether or not to show the overlay.
   */
  @Prop() noOverlay: boolean;

  /**
   * Whether or not to show the modal.
   */
  @Prop() open: boolean;

  /**
   * Override z-index.
   */
  @Prop() zIndexOverride?: number;

  /**
   * Emitted when enter animation starts.
   */
  @Event() cpslModalEntering!: EventEmitter<null>;

  /**
   * Emitted when enter animation finishes.
   */
  @Event() cpslModalEntered!: EventEmitter<null>;

  /**
   * Emitted when exit animation starts.
   */
  @Event() cpslModalExiting!: EventEmitter<null>;

  /**
   * Emitted when exit animation finishes.
   */
  @Event() cpslModalExited!: EventEmitter<null>;

  @Watch('open')
  toggleHeight() {
    if (!this.open) {
      this.cpslModalExiting.emit();
      // Animate out before setting display to none
      setTimeout(() => {
        this.el.style.display = 'none';
        this.cpslModalExited.emit();
      }, this.exitTransitionDuration * 1000);
    } else {
      this.cpslModalEntering.emit();
      this.el.style.display = 'flex';
      setTimeout(() => {
        this.cpslModalEntered.emit();
      }, this.enterTransitionDuration * 1000);
    }
  }

  componentDidLoad() {
    this.toggleHeight();
  }

  render() {
    return (
      <Host class={{ 'open': this.open, 'elevated': this.elevated, 'no-overlay': this.noOverlay }}>
        {!this.noOverlay && (
          <cpsl-overlay
            zIndexOverride={this.zIndexOverride ? this.zIndexOverride : undefined}
            id="overlay"
            open={this.open}
            enterTransitionDuration={this.enterTransitionDuration}
            exitTransitionDuration={this.exitTransitionDuration}
          />
        )}
        <cpsl-card
          class="card"
          style={{ transitionDuration: this.open ? `${this.exitTransitionDuration}s` : `${this.enterTransitionDuration}s` }}
        >
          <slot></slot>
        </cpsl-card>
      </Host>
    );
  }
}
