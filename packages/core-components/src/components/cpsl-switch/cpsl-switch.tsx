import { Component, Host, Prop, Event, h, EventEmitter } from '@stencil/core';

@Component({
  tag: 'cpsl-switch',
  styleUrl: 'cpsl-switch.scss',
  shadow: true,
})
export class CpslSwitch {
  /**
   * Whether or not the switch is checked.
   */
  @Prop() checked: boolean;

  /**
   * Emitted when the switch state changes.
   */
  @Event() cpslSwitchChanged!: EventEmitter<boolean>;

  private handleSwitchClick = () => {
    this.cpslSwitchChanged.emit(!this.checked);
  };

  render() {
    return (
      <Host>
        <input type="checkbox" checked={this.checked} />
        <span onClick={this.handleSwitchClick} class={{ container: true, checked: this.checked }}>
          <span class={{ thumb: true, checked: this.checked }} />
        </span>
      </Host>
    );
  }
}
