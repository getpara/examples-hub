import { Component, Host, Prop, Event, h, EventEmitter } from '@stencil/core';

@Component({
  tag: 'cpsl-select-item',
  styleUrl: 'cpsl-select-item.scss',
  shadow: true,
})
export class CpslSelectItem {
  /**
   * Whether the item is selected or not.
   */
  @Prop() selected?: boolean;

  /**
   * Value of the item.
   */
  @Prop() value: string;

  /**
   * Called when item is clicked.
   * @internal
   */
  @Event() cpslSelectItemClick: EventEmitter<string>;

  private handleItemClick = () => {
    this.cpslSelectItemClick.emit(this.value);
  };

  render() {
    return (
      <Host>
        <div part="outer-container" class="outer-container" onClick={this.handleItemClick}>
          <div part="inner-container" class={{ 'inner-container': true, 'selected': this.selected }}>
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  }
}
