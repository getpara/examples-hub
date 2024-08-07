import { Component, Host, Element, h, Prop, State, EventEmitter, Event, Watch, Listen } from '@stencil/core';

@Component({
  tag: 'cpsl-select',
  styleUrl: 'cpsl-select.scss',
  shadow: true,
})
export class CpslSelect {
  @Element() el!: HTMLCpslSelectElement;
  private popoverEl!: HTMLCpslPopoverElement;
  private inputId = `cpsl-select-${inputIds++}`;

  @State() anchorEl!: HTMLDivElement;
  @State() hasFocus = false;
  @State() popoverOpen = false;
  @State() hasSelectedItem = false;

  /**
   * If `true`, the user cannot interact with the input.
   */
  @Prop() disabled = false;

  /**
   * Set the max height of the dropdown.
   */
  @Prop() dropdownMaxHeight?: number;

  /**
   * Error text to show below the input. If this is provided the input will enter an error state.
   */
  @Prop() errorText?: string;

  /**
   * Format value for display when selected.
   */
  @Prop() formatValue?: (value: string) => string;

  /**
   * Helper text to show below the input. If `"errorText"` is provided that will take precedence.
   */
  @Prop() helperText?: string;

  /**
   * ID of the element, must be unique for the popover trigger.
   */

  @Prop() id: string = `${this.inputId}-trigger`;

  /**
   * The label for the input.
   */
  @Prop() label?: string;

  /**
   * Placeholder to display if `selectedValue` is empty.
   */
  @Prop() placeholder?: string;

  /**
   * If `true`, the user must fill in a value before submitting a form.
   */
  @Prop() required = false;

  /**
   * Value of the selected item.
   */
  @Prop() selectedValue?: string;

  /**
   * Will show the formatted selected item (passed in the `selected-item` slot) in the select rather than the item value.
   */
  @Prop() showFormattedSelectedItem?: boolean;

  /**
   * If `true`, the label will display an "optional" tag.
   */
  @Prop() showOptionalLabel = false;

  /**
   * Emitted when the input loses focus.
   */
  @Event() cpslBlur!: EventEmitter<FocusEvent>;

  /**
   * Emitted when the input has focus.
   */
  @Event() cpslFocus!: EventEmitter<FocusEvent>;

  /**
   * Emitted when the value changes.
   */
  @Event() cpslSelectValueChange!: EventEmitter<string>;

  @Watch('selectedValue')
  onValueChange() {
    this.popoverEl.closePopover();
  }

  @Watch('selectedValue')
  handleValueChange() {
    this.selectItem();
  }

  @Listen('cpslSelectItemClick')
  selectItemClickHandler(event: CustomEvent<string>) {
    this.cpslSelectValueChange.emit(event.detail);
  }

  @Listen('cpslOpen')
  onPopoverOpen() {
    this.popoverOpen = true;
  }

  @Listen('cpslClose')
  onPopoverClose() {
    this.popoverOpen = false;
  }

  componentDidLoad() {
    this.popoverEl = this.el.shadowRoot.querySelector(`cpsl-popover`) as HTMLCpslPopoverElement;
    this.anchorEl = this.el.shadowRoot.getElementById('select-container') as HTMLDivElement;

    this.selectItem();
  }

  private onBlur = (ev: FocusEvent) => {
    this.hasFocus = false;

    this.popoverEl.closePopover();

    this.cpslBlur.emit(ev);
  };

  private onFocus = (ev: FocusEvent) => {
    this.hasFocus = true;

    this.cpslFocus.emit(ev);
  };

  private handleEnterPress = (ev: KeyboardEvent) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      this.el.dispatchEvent(new MouseEvent('mousedown'));
    }
  };

  private selectItem = () => {
    const items = Array.from(this.el.querySelectorAll('cpsl-select-item')) as HTMLCpslSelectItemElement[];

    items.forEach(item => {
      if (item.value === this.selectedValue) {
        item.setAttribute('selected', 'true');
        this.hasSelectedItem = true;
      } else {
        item.setAttribute('selected', 'false');
      }
    });

    if (!Boolean(this.selectedValue)) {
      this.hasSelectedItem = false;
    }
  };

  private handleClickOutside = (event: MouseEvent) => {
    if (this.hasFocus && !this.el.contains(event.target as Node)) {
      this.hasFocus = false;
      window.removeEventListener('click', this.handleClickOutside);
    }
  };

  private handleClick = () => {
    if (!this.disabled) {
      this.hasFocus = true;
      window.addEventListener('click', this.handleClickOutside);
    }
  };

  render() {
    return (
      <Host
        id={this.id}
        class={{ 'disabled': this.disabled, 'focused': this.hasFocus, 'has-value': Boolean(this.selectedValue) }}
      >
        {this.label && (
          <label class="label" htmlFor={this.inputId}>
            {this.label}
            {this.required ? '*' : ' '}
            {!this.required && this.showOptionalLabel ? <span class="optional-label">(optional)</span> : ''}
          </label>
        )}
        <div
          id="select-container"
          class={{ 'select-container': true, 'error-container': Boolean(this.errorText) }}
          onMouseDown={this.handleClick}
        >
          {this.hasSelectedItem && this.showFormattedSelectedItem && <slot name="selected-item"></slot>}
          <div class="selected-container-content" id="selected-container-content">
            {(!this.hasSelectedItem || !this.showFormattedSelectedItem) && (
              <cpsl-text class={{ 'selected-text': true, 'placeholder': !Boolean(this.selectedValue) }}>
                {!Boolean(this.selectedValue)
                  ? (this.placeholder ?? 'Select')
                  : (this.formatValue?.(this.selectedValue) ?? this.selectedValue)}
              </cpsl-text>
            )}
          </div>
          <cpsl-icon
            class={{ 'chevron': true, 'open': this.popoverOpen, 'has-value': Boolean(this.selectedValue) }}
            icon="chevronUp"
          />
          <input
            id={this.inputId}
            disabled={this.disabled}
            class={{ disabled: this.disabled }}
            value={this.selectedValue}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onKeyPress={this.handleEnterPress}
            inputmode="none"
          />
        </div>
        {(this.errorText || this.helperText) && (
          <div class={{ 'helper-text-container': true, 'error-text': Boolean(this.errorText) }}>
            <span>{this.errorText ?? this.helperText}</span>
          </div>
        )}
        <cpsl-popover
          autoWidth={false}
          trigger={this.id}
          preventBlur={this.hasFocus}
          disabled={this.disabled}
          anchorEl={this.anchorEl}
        >
          <div class="dropdown">
            <div class="dropdown-inner" style={{ maxHeight: `${this.dropdownMaxHeight}px` }}>
              <slot name="items"></slot>
            </div>
          </div>
        </cpsl-popover>
      </Host>
    );
  }
}

let inputIds = 0;
