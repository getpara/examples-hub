import { Component, EventEmitter, Host, Prop, Event, h } from '@stencil/core';

@Component({
  tag: 'cpsl-radio',
  styleUrl: 'cpsl-radio.scss',
  shadow: true,
})
export class CpslRadio {
  /**
   * Whether or not the radio is checked.
   */
  @Prop() checked: boolean;

  /**
   * Emitted when the radio state changes.
   */
  @Event() cpslRadioChanged!: EventEmitter<boolean>;

  private handleRadioClick = () => {
    if (!this.checked) {
      this.cpslRadioChanged.emit(!this.checked);
    }
  };

  render() {
    return (
      <Host>
        <input type="radio" checked={this.checked} />
        <span onClick={this.handleRadioClick} class={{ container: true, checked: this.checked }} />
      </Host>
    );
  }
}
