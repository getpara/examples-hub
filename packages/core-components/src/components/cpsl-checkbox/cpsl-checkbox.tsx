import { Component, EventEmitter, Host, Prop, Event, h } from '@stencil/core';

@Component({
  tag: 'cpsl-checkbox',
  styleUrl: 'cpsl-checkbox.scss',
  shadow: true,
})
export class CpslCheckbox {
  /**
   * Whether or not the checkbox is checked.
   */
  @Prop() checked: boolean;

  /**
   * Emitted when the checkbox state changes.
   */
  @Event() cpslCheckboxChanged!: EventEmitter<boolean>;

  private handleCheckboxClick = () => {
    this.cpslCheckboxChanged.emit(!this.checked);
  };

  render() {
    return (
      <Host>
        <input type="checkbox" checked={this.checked} />
        <span onClick={this.handleCheckboxClick} class={{ container: true, checked: this.checked }}>
          <cpsl-icon icon="check" />
        </span>
      </Host>
    );
  }
}
