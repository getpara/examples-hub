import { Component, Host, Prop, Element, h, Watch } from '@stencil/core';

@Component({
  tag: 'cpsl-button-group',
  styleUrl: 'cpsl-button-group.scss',
  shadow: true,
})
export class CpslButtonGroup {
  @Element() el!: HTMLCpslButtonGroupElement;

  /**
   * The id of the selected button.
   */
  @Prop() selectedId?: string;

  @Watch('selectedId')
  selectItem() {
    this.buttonSlots.forEach(item => {
      if (item.id === this.selectedId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  componentWillRender() {
    this.buttonSlots.forEach(item => {
      item.setAttribute('variant', 'secondary');
      item.setAttribute('full-width', 'true');
      this.selectItem();
    });

    if (this.otherSlots?.length) {
      console.error('cpsl-button is the only valid child of cpsl-button-group');
      this.otherSlots.forEach(item => item.remove());
    }
  }

  private get buttonSlots() {
    return this.el.querySelectorAll('cpsl-button');
  }

  private get otherSlots() {
    return this.el.querySelectorAll('&> *:not(cpsl-button)');
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
