import { Component, Element, Host, Prop, State, Watch, h, Event, EventEmitter } from '@stencil/core';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import { MOBILE_SIZE } from '../../constants';

gsap.registerPlugin(Draggable);
const mm = gsap.matchMedia();
@Component({
  tag: 'cpsl-modal',
  styleUrl: 'cpsl-modal.scss',
  shadow: true,
})
export class CpslModal {
  private draggable: Draggable;
  private expandFooterTl: gsap.core.Timeline;
  private hasAnimatedIn: boolean;

  @Element() el!: HTMLCpslModalElement;

  @State() hasFooter: boolean;

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
   * Whether or not to show `footerExpandedFooter` and `footerExpandedHeader` slots.
   */
  @Prop() footerExpanded?: boolean;

  /**
   * Duration in seconds of the footer expansion animation.
   * Default is 0.15.
   */
  @Prop() footerTransitionDuration?: number = 0.15;

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

  @Watch('footerExpanded')
  toggleHeight() {
    this.footerExpanded ? this.expandFooterTl.play() : this.expandFooterTl.reverse();
  }

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
      this.draggable?.disable();
      gsap.timeline({}).set(this.modalWrapperEl, { yPercent: 0, scale: this.open ? 1 : 0.8, opacity: this.open ? 1 : 0 });
    });
    mm.add(`(max-width: ${MOBILE_SIZE}px)`, () => {
      this.initDraggable();
      gsap.timeline({}).set(this.modalWrapperEl, { scale: 1, opacity: 1, yPercent: this.open ? -100 : 0 });
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
              this.addExpandAnim();
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
              this.addExpandAnim();
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

  private addExpandAnim() {
    setTimeout(() => {
      this.expandFooterTl = gsap
        .timeline({
          reversed: true,
          paused: true,
          onReverseComplete: () => {
            this.contentEl.style.setProperty('height', 'auto');
          },
          defaults: {
            duration: this.footerTransitionDuration,
          },
        })
        .set(this.footerExpandedEl, { overflow: 'auto', display: 'block' })
        .set(this.headerExpandedEl, { display: 'block' })
        .to(this.innerContainerEl, { paddingBottom: '8px' })
        .to(this.contentEl, { height: '0px', overflow: 'hidden', opacity: 0 }, '<')
        .to(this.footerEl, { height: '0px', overflow: 'hidden', opacity: 0 }, '<')
        .to(this.footerExpandedEl, { height: 'auto', opacity: 1 }, '<')
        .to(this.headerExpandedEl, { height: 'auto', opacity: 1 }, '<');
    }, 10);
  }

  private getDraggableHeight = () => {
    return this.innerContainerEl.clientHeight;
  };

  private initDraggable() {
    this.draggable = Draggable.create(this.modalContainerEl, {
      trigger: this.headerEl,
      dragClickables: false,
      type: 'y',
      edgeResistance: 0.2,
      liveSnap: {
        y: function (y) {
          if (y < 0) return 0; // Restricts dragging to down
          return y;
        },
      },
      onDrag: () => {
        const y = gsap.utils.mapRange(0, this.getDraggableHeight(), 1, 0, this.draggable.y);
        gsap.set(this.overlayEl, { opacity: y });
      },
      onDragEnd: () => {
        if (this.draggable.y > 60) {
          this.cpslModalRequestClose.emit();
        } else {
          gsap.set(this.overlayEl, { opacity: 1 });
          gsap.set(this.modalWrapperEl, { yPercent: -100 });
          gsap.set(this.modalContainerEl, { y: 0 });
        }
      },
    })[0];
  }

  private get footerEl() {
    return this.el.shadowRoot.getElementById('modal-footer');
  }

  private get footerExpandedEl() {
    return this.el.shadowRoot.getElementById('modal-footer-expanded');
  }

  private get headerExpandedEl() {
    return this.el.shadowRoot.getElementById('modal-header-expanded');
  }

  private get innerContainerEl() {
    return this.el.shadowRoot.getElementById('modal-inner-container');
  }

  private get contentEl() {
    return this.el.shadowRoot.getElementById('modal-content');
  }

  private get modalWrapperEl() {
    return this.el.shadowRoot.getElementById('modal-wrapper');
  }

  private get modalContainerEl() {
    return this.el.shadowRoot.getElementById('modal-container');
  }

  private get overlayEl() {
    return this.el.shadowRoot.getElementById('overlay');
  }

  private get footerSlotEl() {
    return this.footerEl.querySelectorAll('slot')[0];
  }

  private get headerEl() {
    return this.el.shadowRoot.getElementById('modal-header');
  }

  private get Modal() {
    return (
      <div class={{ 'modal-container': true, 'no-footer': !this.hasFooter }} part="modal-container" id="modal-container">
        <slot></slot>
        <div
          id="modal-inner-container"
          class={{ 'modal-inner-container': true, 'no-footer': !this.hasFooter }}
          part="modal-inner-container"
        >
          <div id="modal-content" part="modal-content">
            <div id="modal-header" class="modal-header" part="modal-header">
              <slot name="header"></slot>
            </div>
            <div id="modal-body" class="modal-body" part="modal-body">
              <slot name="body"></slot>
            </div>
          </div>
          <div
            id="modal-header-expanded"
            class={{ 'modal-header': true, 'expanded': true, 'no-opacity': true }}
            part="modal-header-expanded"
          >
            <slot name="footerExpandedHeader"></slot>
          </div>
        </div>
        <div id="modal-footer" part="modal-footer">
          <slot name="footer"></slot>
        </div>
        <div id="modal-footer-expanded" class={{ 'expanded': true, 'no-opacity': true }} part="modal-footer-expanded">
          <slot name="footerExpandedFooter"></slot>
        </div>
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
      <Host
        style={this.zIndexOverride ? { zIndex: `${this.zIndexOverride}` } : {}}
        class={{ 'include-mobile-styling': true }}
      >
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
