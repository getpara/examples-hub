import { Component, Element, Host, Prop, State, Watch, h, Event, EventEmitter } from '@stencil/core';
import gsap from 'gsap';
import { MOBILE_SIZE } from '../../constants.js';

const mm = gsap.matchMedia();
@Component({
  tag: 'cpsl-auth-modal',
  styleUrl: 'cpsl-auth-modal.scss',
  shadow: true,
})
export class CpslAuthModal {
  private hasAnimatedIn: boolean;

  @Element() el!: HTMLCpslAuthModalElement;

  @State() hasFooter: boolean;
  @State() isMobile: boolean;

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
   * Whether or not to show the overlay. This will always show the modal, regardless of the value of `open`.
   */
  @Prop() noOverlay?: boolean;

  /**
   * Whether or not to show the modal.
   */
  @Prop() open: boolean;

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

  /**
   * Emitted when exit animation finishes.
   */
  @Event() cpslModalRequestClose!: EventEmitter<null>;

  /**
   * Override z-index.
   */
  @Prop() zIndexOverride?: number;

  @Watch('open')
  toggleModal() {
    if (this.hasAnimatedIn) {
      this.handleAnimation();
    }
  }

  componentDidLoad() {
    this.handleAnimation();
    this.hasAnimatedIn = true;

    mm.add(`(min-width: ${MOBILE_SIZE + 1}px)`, () => {
      gsap.timeline({}).set(this.modalWrapperEl, { yPercent: 0, scale: this.open ? 1 : 0.8, opacity: this.open ? 1 : 0 });
      this.isMobile = false;
    });
    mm.add(`(max-width: ${MOBILE_SIZE}px)`, () => {
      gsap.timeline({}).set(this.modalWrapperEl, { scale: 1, opacity: 1, yPercent: this.open ? -100 : 0 });
      this.isMobile = true;
    });

    this.hasFooter = this.footerSlotEl.assignedNodes().length >= 1;
    this.footerSlotEl.addEventListener('slotchange', () => {
      if (this.footerSlotEl.assignedNodes().length >= 1) {
        this.hasFooter = true;
      } else {
        this.hasFooter = false;
      }
    });
  }

  private handleAnimation() {
    if (this.open) {
      if (window.innerWidth >= MOBILE_SIZE + 1) {
        gsap
          .timeline({
            onStart: () => {
              this.cpslModalEntering.emit();
            },
            onComplete: () => {
              this.cpslModalEntered.emit();
            },
          })
          .set(this.modalWrapperEl, { display: 'flex', yPercent: 0 })
          .to(this.modalWrapperEl, {
            scale: 1,
            opacity: 1,
            duration: this.enterTransitionDuration,
          });
      } else {
        gsap
          .timeline({
            onStart: () => {
              this.cpslModalEntering.emit();
            },
            onComplete: () => {
              this.cpslModalEntered.emit();
            },
          })
          .set(this.modalWrapperEl, { display: 'flex', scale: 1, opacity: 1 })
          .to(this.modalWrapperEl, {
            yPercent: -100,
            duration: this.enterTransitionDuration,
          });
      }
    } else {
      if (window.innerWidth >= MOBILE_SIZE + 1) {
        gsap
          .timeline({
            onStart: () => {
              this.cpslModalExiting.emit();
            },
            onComplete: () => {
              this.cpslModalExited.emit();
              this.modalWrapperEl?.style.setProperty('display', 'none');
            },
          })
          .to(this.modalWrapperEl, {
            scale: 0.8,
            opacity: 0,
            duration: this.exitTransitionDuration,
          });
      } else {
        gsap
          .timeline({
            onStart: () => {
              this.cpslModalExiting.emit();
            },
            onComplete: () => {
              this.cpslModalExited.emit();
              this.modalWrapperEl?.style.setProperty('display', 'none');
            },
          })
          .to(this.modalWrapperEl, {
            yPercent: 0,
            duration: this.exitTransitionDuration,
          })
          .set(this.modalContainerEl, { y: 0 });
      }
    }
  }

  private get footerEl() {
    return this.el.shadowRoot.getElementById('modal-footer');
  }

  private get modalWrapperEl() {
    return this.el.shadowRoot.getElementById('modal-wrapper');
  }

  private get modalContainerEl() {
    return this.el.shadowRoot.getElementById('modal-container');
  }

  private get footerSlotEl() {
    return this.footerEl.querySelectorAll('slot')[0];
  }

  private get Modal() {
    return (
      <div class={{ 'modal-container': true, 'no-footer': !this.hasFooter }} part="modal-container" id="modal-container">
        <cpsl-card id="modal-body-card" class={{ 'modal-body-card': true, 'body': true }} part="modal-body-card">
          <slot name="body"></slot>
          {this.isMobile && (
            <div class="mobile-footer">
              <slot name="footer"></slot>
            </div>
          )}
        </cpsl-card>
        <cpsl-card
          id="modal-footer"
          part="modal-footer"
          class={{ 'footer-hidden': !this.hasFooter, 'modal-body-card': true }}
          style={{ display: !this.isMobile ? 'block' : 'none' }}
        >
          <slot name="footer"></slot>
        </cpsl-card>
      </div>
    );
  }

  render() {
    if (this.noOverlay) {
      return (
        <Host style={this.zIndexOverride ? { zIndex: `${this.zIndexOverride}` } : {}} class="no-overlay">
          {this.Modal}
        </Host>
      );
    }

    return (
      <Host style={this.zIndexOverride ? { zIndex: `${this.zIndexOverride}` } : {}} class={{ 'include-mobile-styling': true }}>
        <cpsl-overlay
          zIndexOverride={this.zIndexOverride ? this.zIndexOverride : undefined}
          id="overlay"
          open={this.open}
          enterTransitionDuration={this.enterTransitionDuration}
          exitTransitionDuration={this.exitTransitionDuration}
        />
        <div id="modal-wrapper" class="modal-wrapper">
          {this.Modal}
        </div>
      </Host>
    );
  }
}
