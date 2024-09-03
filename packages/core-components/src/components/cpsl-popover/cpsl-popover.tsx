import { Component, Host, Prop, State, Watch, Element, h, Method, Event, EventEmitter } from '@stencil/core';
import { InteractionCallback } from '../../interface';

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
  private triggerClicked = false;
  @State() positionX?: number;
  @State() positionY?: number;

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
  onAnchorChange() {
    this.setPosition();
  }

  @Watch('open')
  onOpenChange() {
    if (this.open) {
      window.addEventListener('click', this.handleClickOutside);
      window.addEventListener('scroll', () => this.setPosition(), true);
      window.addEventListener('resize', () => this.setPosition(), true);
    } else {
      window.removeEventListener('click', this.handleClickOutside);
      window.removeEventListener('scroll', () => this.setPosition(), true);
      window.removeEventListener('resize', () => this.setPosition(), true);
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
            eventName: 'mousedown',
            callback: e => {
              if (this.preventBlur) {
                e.preventDefault();
              }
              this.present();
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
    if (anchorEl) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const elWidth = this.el.clientWidth;
      const elHeight = this.el.clientHeight;
      const { top, left, height, width } = anchorEl.getBoundingClientRect();

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

  private handleClickOutside = (event: MouseEvent) => {
    if (!this.triggerClicked && this.triggerEl.contains(event.target as Node)) {
      this.triggerClicked = true;
      return;
    }
    if (this.open && !this.el.contains(event.target as Node)) {
      event.preventDefault();
      this.close();
    }
  };

  private present = () => {
    if (!this.open && !this.disabled) {
      this.open = true;
      this.cpslOpen.emit();
      this.setPosition();
    }
  };

  private close = () => {
    this.open = false;
    this.triggerClicked = false;
    this.cpslClose.emit();
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
        style={{ top: `${this.positionY}px`, left: `${this.positionX}px`, width: !this.open ? '0px' : this.autoWidth ? 'auto' : `${this.triggerEl?.clientWidth}px` }}
      >
        <div id="container" class={{ container: true, open: this.open }}>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
