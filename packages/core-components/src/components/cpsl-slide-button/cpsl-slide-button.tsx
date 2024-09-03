import { Component, Host, Prop, h, Element, EventEmitter, Event } from '@stencil/core';
import { IconType } from '../../interface';

@Component({
  tag: 'cpsl-slide-button',
  styleUrl: 'cpsl-slide-button.scss',
  shadow: true,
})
export class CpslSlideButton {
  @Element() el!: HTMLCpslSlideButtonElement;

  /**
   * Whether or not the component is disabled. If true, the component will display the `startText`.
   */
  @Prop() disabled: boolean;

  /**
   * The name of the ending icon to show.
   */
  @Prop() endIcon: IconType;

  /**
   * The ending text.
   */
  @Prop() endText: string;

  /**
   * The name of the starting icon to show.
   */
  @Prop() startIcon: IconType;

  /**
   * The starting text.
   */
  @Prop() startText: string;

  /**
   * The `cpslComplete` event is fired when the slider is at the end.
   */
  @Event() cpslComplete!: EventEmitter<boolean>;

  componentDidLoad() {
    this.dragElement(this.el.shadowRoot.getElementById('slider'));
  }

  private dragElement(el: HTMLElement) {
    const pointerDown = (e: PointerEvent) => {
      pos3 = e.clientX;

      switch (e.pointerType) {
        case 'mouse':
          el.onmousedown = dragMouseDown;
          break;
        default:
          el.ontouchstart = dragTouchDown;
      }
    };

    const dragMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementMouseDrag;
    };

    const dragTouchDown = (e: TouchEvent) => {
      e.preventDefault();
      const touchLocation = e.targetTouches[0];
      // get the mouse cursor position at startup:
      pos3 = touchLocation.clientX;
      document.ontouchend = closeDragElement;
      // call a function whenever the cursor moves:
      document.ontouchmove = elementTouchDrag;
    };

    const elementMouseDrag = (e: MouseEvent) => {
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos3 = e.clientX;
      // set the element's new position:
      finishElementDrag(pos1);
    };

    const elementTouchDrag = (e: TouchEvent) => {
      e.preventDefault();
      const touchLocation = e.targetTouches[0];
      // calculate the new cursor position:
      pos1 = pos3 - touchLocation.clientX;
      pos3 = touchLocation.clientX;
      // set the element's new position:
      finishElementDrag(pos1);
    };

    const finishElementDrag = (pos: number) => {
      const newPos = el.offsetLeft - pos;
      if (newPos >= minX && newPos <= maxX) {
        const newPosPercent = Math.max(Math.min(Math.round((newPos / maxX) * 100) / 100, 100), 0);

        startTextEl.style.opacity = `${(1 - newPosPercent * 2) * 100}%`;
        endTextEl.style.opacity = `${newPosPercent * 100}%`;

        startIconEl.style.opacity = `${(1 - newPosPercent * 2) * 100}%`;
        endIconEl.style.opacity = `${newPosPercent * 100}%`;

        endBackgroundEl.style.opacity = `${newPosPercent * 100}%`;

        el.style.left = `${newPos}px`;
      }
    };

    const closeDragElement = () => {
      if (el.offsetLeft + sliderHeight >= containerWidth - sliderHeight / 2) {
        el.style.left = `${maxX}px`;
        startTextEl.style.opacity = '0%';
        endTextEl.style.opacity = '100%';
        startIconEl.style.opacity = '0%';
        endIconEl.style.opacity = '100%';
        endBackgroundEl.style.opacity = '100%';
        this.cpslComplete.emit(true);
      } else {
        el.style.left = `${minX}px`;
        startTextEl.style.opacity = '100%';
        endTextEl.style.opacity = '0%';
        startIconEl.style.opacity = '100%';
        endIconEl.style.opacity = '0%';
        endBackgroundEl.style.opacity = '0%';
      }
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
      document.ontouchend = null;
      document.ontouchmove = null;
    };

    const startIconEl = this.startIconEl;
    const endIconEl = this.endIconEl;
    const startTextEl = this.startTextEl;
    const endTextEl = this.endTextEl;
    const endBackgroundEl = this.endBackgroundEl;

    const sliderContainerEl = this.sliderContainerEl;
    const containerWidth = sliderContainerEl.clientWidth;

    const sliderHeight = el.getBoundingClientRect().height;

    // Offset min by 1 for 1px left padding
    const minX = 1;
    // Offset max by the slider width and 1px for padding
    const maxX = containerWidth - sliderHeight - 1;

    let pos1 = 0,
      pos3 = 0;

    el.onpointerdown = pointerDown;
  }

  private get sliderContainerEl() {
    return this.el.shadowRoot.getElementById('slider-container');
  }

  private get startTextEl() {
    return this.el.shadowRoot.getElementById('start-text');
  }

  private get endTextEl() {
    return this.el.shadowRoot.getElementById('end-text');
  }

  private get endBackgroundEl() {
    return this.el.shadowRoot.getElementById('end-slider-container-background');
  }

  private get startIconEl() {
    return this.el.shadowRoot.getElementById('start-icon');
  }

  private get endIconEl() {
    return this.el.shadowRoot.getElementById('end-icon');
  }

  render() {
    return (
      <Host>
        <div id="slider-container" class="slider-container">
          <div id="start-slider-container-background" class={{ 'start-slider-container-background': true, 'slider-container-background': true }} />
          <div id="end-slider-container-background" class={{ 'end-slider-container-background': true, 'slider-container-background': true }} />
          <div id="slider" class={{ slider: true, disabled: this.disabled }}>
            <cpsl-icon id="start-icon" class={{ 'start-icon': true, 'icon': true }} icon={this.startIcon} />
            <cpsl-icon id="end-icon" class={{ 'end-icon': true, 'icon': true }} icon={this.endIcon} />
          </div>
          <span id="start-text" class={{ 'start-text': true, 'disabled': this.disabled }}>
            {this.startText}
          </span>
          <span id="end-text" class="end-text">
            {this.endText}
          </span>
        </div>
      </Host>
    );
  }
}
