import { Component, Host, Prop, State, Watch, Element, h, Method, Event, EventEmitter } from '@stencil/core';
import { InteractionCallback } from '../../interface.js';

@Component({
  tag: 'cpsl-popover',
  styleUrl: 'cpsl-popover.scss',
  shadow: true,
})
export class CpslPopover {
  private triggerEl?: HTMLElement | null;
  private destroyTriggerInteraction?: () => void;

  @Element() el!: HTMLCpslPopoverElement;

  @State() open = false;
  @State() hasSetInitialPosition = false;
  @State() positionX?: number;
  @State() positionY?: number;

  private startedInside = false;
  private startedWhenMounted = false;

  /**
   * ID for the element that the popover anchors to.
   */
  @Prop() anchorEl?: HTMLElement;

  /**
   * Vertical anchor origin.
   * Options are: `"left"`, `"center"`, `"right"`.
   * Default is: `"left"`.
   */
  @Prop() anchorOriginHorizontal?: 'left' | 'center' | 'right' = 'left';

  /**
   * Vertical anchor origin.
   * Options are: `"top"`, `"center"`, `"bottom"`.
   * Default is: `"bottom"`.
   */
  @Prop() anchorOriginVertical?: 'top' | 'center' | 'bottom' = 'bottom';

  /**
   * If `true` the container will use the width of the content, else it will be set to the width of the trigger.
   * Default is `true`
   */
  // eslint-disable-next-line @stencil-community/ban-default-true
  @Prop() autoWidth?: boolean = true;

  /**
   * Whether or not to disable to popover.
   */
  @Prop() disabled: boolean;

  /**
   * Used internally to prevent select from blurring unintentionally.
   */
  @Prop() preventBlur: boolean;

  /**
   * Vertical transformation origin.
   * Options are: `"left"`, `"center"`, `"right"`.
   * Default is: `"left"`.
   */
  @Prop() transformOriginHorizontal?: 'left' | 'center' | 'right' = 'left';

  /**
   * Vertical transformation origin.
   * Options are: `"top"`, `"center"`, `"bottom"`.
   * Default is: `"bottom"`.
   */
  @Prop() transformOriginVertical?: 'top' | 'center' | 'bottom' = 'top';

  /**
   * If `true`, the popover will be aligned to the center of the trigger element.
   * Default is `false`.
   */
  @Prop() alignCenter: boolean = false;

  /**
   * Which trigger causes the popover to open.
   * Options are: `"click"`, `"hover"`.
   * Default is: `"click"`.
   */
  @Prop() triggerAction: 'click' | 'hover' = 'click';

  /**
   * ID for the element that triggers the popover to open.
   */
  @Prop() trigger: string;

  /**
   * Padding from edge of window for the popover container.
   */
  @Prop() windowPadding?: number = 16;

  /**
   * Emitted when the popover opens.
   */
  @Event() cpslOpen!: EventEmitter<void>;

  /**
   * Emitted when the popover closes.
   */
  @Event() cpslClose!: EventEmitter<void>;

  /**
   * Call to close the popover manually.
   */
  @Method()
  async closePopover() {
    this.close();
  }

  @Watch('trigger')
  @Watch('triggerAction')
  @Watch('preventBlur')
  onTriggerChange() {
    this.configureTriggerInteraction();
  }

  @Watch('anchorOriginHorizontal')
  @Watch('anchorOriginVertical')
  @Watch('alignCenter')
  onAnchorChange() {
    this.setPosition();
  }

  @Watch('open')
  onOpenChange() {
    if (typeof window !== 'undefined') {
      if (this.open) {
        window.addEventListener('mousedown', this.validateEventStart);
        window.addEventListener('touchstart', this.validateEventStart);
        window.addEventListener('click', this.handleClickOutside);
        window.addEventListener('scroll', () => this.setPosition(), true);
        window.addEventListener('resize', () => this.setPosition(), true);
      } else {
        window.removeEventListener('mousedown', this.validateEventStart);
        window.removeEventListener('touchstart', this.validateEventStart);
        window.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('scroll', () => this.setPosition(), true);
        window.removeEventListener('resize', () => this.setPosition(), true);
      }
    }
  }

  componentDidLoad() {
    this.configureTriggerInteraction();
  }

  private configureTriggerInteraction = () => {
    const { trigger, triggerAction, destroyTriggerInteraction } = this;

    if (destroyTriggerInteraction) {
      destroyTriggerInteraction();
    }

    if (trigger === undefined) {
      return;
    }

    this.triggerEl = document.getElementById(trigger);
    if (!this.triggerEl) {
      console.error(`A trigger element with the ID "${trigger}" was not found in the DOM.`, this.el);
      return;
    }

    let triggerCallbacks: InteractionCallback[] = [];
    /**
     * Based upon the kind of trigger interaction
     * the user wants, we setup the correct event
     * listeners.
     */
    switch (triggerAction) {
      case 'hover':
        triggerCallbacks = [
          {
            eventName: 'mouseenter',
            callback: async () => {
              this.present();
            },
          },
          {
            eventName: 'mouseleave',
            callback: () => {
              if (!this.containerEl.matches(':hover')) {
                this.close();
              } else {
                this.containerEl.addEventListener('mouseleave', () => {
                  this.close();
                });
              }
            },
          },
          {
            eventName: 'click',
            callback: (ev: Event) => ev.stopPropagation(),
          },
        ];

        break;
      case 'click':
      default:
        triggerCallbacks = [
          {
            eventName: 'click',
            callback: (e: Event) => {
              const targetId = (e.target as any).id ?? '';

              if (targetId === 'ignore-click') {
                return;
              }

              if (!this.open) {
                this.present();
              }
            },
          },
        ];
        break;
    }

    triggerCallbacks.forEach(({ eventName, callback }) => this.triggerEl.addEventListener(eventName, callback));

    this.destroyTriggerInteraction = () => {
      triggerCallbacks.forEach(({ eventName, callback }) => this.triggerEl.removeEventListener(eventName, callback));
    };
  };

  private setPosition = () => {
    const anchorEl = this.anchorEl ?? this.triggerEl;
    if (anchorEl && typeof window !== 'undefined') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const elWidth = this.el.clientWidth;
      const elHeight = this.el.clientHeight;
      const { top, left, height, width } = anchorEl.getBoundingClientRect();

      if (this.alignCenter) {
        this.positionX = left + (width / 2 - elWidth / 2);
      } else {
        switch (this.anchorOriginHorizontal) {
          case 'left': {
            this.positionX = left;
            break;
          }
          case 'center': {
            this.positionX = left + width / 2;
            break;
          }
          case 'right': {
            this.positionX = left + width;
            break;
          }
        }
      }

      switch (this.anchorOriginVertical) {
        case 'top': {
          this.positionY = top;
          break;
        }
        case 'center': {
          this.positionY = top + height / 2;
          break;
        }
        case 'bottom': {
          this.positionY = top + height;
          break;
        }
      }

      if (this.positionY < this.windowPadding) {
        this.positionY = this.windowPadding;
      }
      if (this.positionY + elHeight > windowHeight - 16) {
        this.positionY = windowHeight - this.windowPadding - elHeight;
      }

      if (this.positionX < this.windowPadding) {
        this.positionX = this.windowPadding;
      }
      if (this.positionX + elWidth > windowWidth - 16) {
        this.positionX = windowWidth - this.windowPadding - elWidth;
      }
    }
  };

  private validateEventStart = event => {
    this.startedWhenMounted = !!this.triggerEl;
    this.startedInside = this.triggerEl.contains(event.target);
    this.present();
  };

  private handleClickOutside = (event: MouseEvent) => {
    // Do nothing if `mousedown` or `touchstart` started inside ref element
    if (this.startedInside || !this.startedWhenMounted) return;

    // Do nothing if clicking ref's element or descendent elements
    if (!this.triggerEl || this.triggerEl.contains(event.target as Node)) return;

    if (this.open) {
      event.preventDefault();
      this.close();
    }
  };

  private present = () => {
    if (!this.open && !this.disabled) {
      this.open = true;
      this.cpslOpen.emit();

      // Using a small timeout here to ensure the popover is open before attempting to do position calculations
      setTimeout(() => {
        this.setPosition();
        this.hasSetInitialPosition = true;
      }, 20);
    }
  };

  private close = () => {
    this.open = false;
    this.startedInside = false;
    this.cpslClose.emit();
    this.hasSetInitialPosition = false;
  };

  get containerEl() {
    return this.el?.shadowRoot?.getElementById('container');
  }

  render() {
    return (
      <Host
        class={{
          'open': this.open,
          'transform-h-left': this.transformOriginHorizontal === 'left',
          'transform-h-center': this.transformOriginHorizontal === 'center',
          'transform-h-right': this.transformOriginHorizontal === 'right',
          'transform-v-top': this.transformOriginVertical === 'top',
          'transform-v-center': this.transformOriginVertical === 'center',
          'transform-v-bottom': this.transformOriginVertical === 'bottom',
        }}
        style={{
          top: `${this.positionY}px`,
          left: `${this.positionX}px`,
          width: !this.open ? '0px' : this.autoWidth ? 'auto' : `${this.triggerEl?.clientWidth}px`,
        }}
      >
        <div
          id="container"
          class={{ container: true, open: this.open }}
          style={{
            visibility: this.hasSetInitialPosition ? 'visible' : 'hidden',
          }}
        >
          <slot></slot>
        </div>
      </Host>
    );
  }
}
