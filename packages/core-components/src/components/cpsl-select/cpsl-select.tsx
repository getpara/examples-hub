import { Component, Host, Element, h, Prop, State, EventEmitter, Event, Watch, Listen } from '@stencil/core';
import { IconType } from '../../interface.js';

@Component({
  tag: 'cpsl-select',
  styleUrl: 'cpsl-select.scss',
  shadow: true,
})
export class CpslSelect {
  @Element() el!: HTMLCpslSelectElement;
  private popoverEl!: HTMLCpslPopoverElement;
  private inputId = `cpsl-select-${inputIds++}`;

  @State() anchorEl!: HTMLElement;
  @State() hasFocus = false;
  @State() popoverOpen = false;
  @State() hasSelectedItem = false;

  /**
   * ID of element to anchor popover to.
   */
  @Prop() anchorElId?: string;

  /**
   * If `true` the popover container will use the width of the content, else it will be set to the width of the trigger.
   * Default is `false`
   */
  @Prop() autoWidth?: boolean = false;

  /**
   * If `true`, the popover will be aligned to the center of the trigger element.
   * Default is `false`.
   */
  @Prop() alignCenter: boolean = false;

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
  @Prop() formatValue?: (value: string | string[]) => string;

  /**
   * Helper text to show below the input. If `"errorText"` is provided that will take precedence.
   */
  @Prop() helperText?: string;

  /**
   * ID of the element, must be unique for the popover trigger.
   */

  @Prop() id: string = `${this.inputId}-trigger`;

  /**
   * The name of the icon to use for the end icon.
   * Default: `chevronUp`
   */
  @Prop() icon?: IconType | null = 'chevronUp';

  /**
   * The label for the input.
   */
  @Prop() label?: string;

  /**
   * If `true`, the user can select more than one value.
   */
  @Prop() multiple?: boolean;

  /**
   * Whether or not to show the rotation animation for the end icon.
   */
  @Prop() noIconAnimation?: boolean;

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
  @Prop() selectedValue?: string | string[];

  /**
   * Will show the formatted selected item (passed in the `selected-item` slot) in the select rather than the item value.
   */
  @Prop() showFormattedSelectedItem?: boolean;

  /**
   * If `true`, the label will display an "optional" tag.
   */
  @Prop() showOptionalLabel = false;

  /**
   * If `true`, the dropdown will contain a search field.
   */
  @Prop() showSearch = false;

  /**
   * Placeholder for the search field.
   */
  @Prop() searchPlaceholder?: string;

  /**
   * The color of the selected item or placeholder text.
   * Options are: `"primary"`, `"secondary", `"tertiary", `"subtle", `"inverted", `"error".
   * Default is: `"primary"`.
   */
  @Prop() selectedItemColor?: 'primary' | 'secondary' | 'tertiary' | 'subtle' | 'inverted' | 'error' | 'contrast' = 'primary';

  /**
   * The variant of the selected item or placeholder text.
   * Options are: `"body2XS"`, `"bodyXS", `"bodyS", `"bodyM", `"bodyL", `"bodyXL", `"headingXS", `"headingS", `"headingM", `"headingL", `"headingXL", `"heading2XL".
   * Default is: `"bodyM"`.
   */
  @Prop() selectedItemVariant?: 'body2XS' | 'bodyXS' | 'bodyS' | 'bodyM' | 'bodyL' | 'bodyXL' | 'headingXS' | 'headingS' | 'headingM' | 'headingL' | 'headingXL' | 'heading2XL' =
    'bodyM';

  /**
   * The weight of the selected item or placeholder text.
   * Options are: `"regular"`, `"medium", `"semiBold", `"bold".
   * Default is: `"regular"`.
   */
  @Prop() selectedItemWeight?: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular';

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

  /**
   * Emitted when the search value changes.
   */
  @Event() cpslSearchChange!: EventEmitter<string>;

  @Watch('selectedValue')
  onValueChange() {
    if (!this.multiple) {
      this.popoverEl.closePopover();
    }
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
    this.anchorEl = this.anchorElId ? document.getElementById(this.anchorElId) : this.el.shadowRoot.getElementById('select-container');

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
      if (typeof this.selectedValue === 'string') {
        if (item.value === this.selectedValue) {
          item.setAttribute('selected', 'true');
        } else {
          item.setAttribute('selected', 'false');
        }
      } else {
        if (this.selectedValue?.includes(item.value)) {
          item.setAttribute('selected', 'true');
        } else {
          item.setAttribute('selected', 'false');
        }
      }
    });

    this.hasSelectedItem = typeof this.selectedValue === 'string' ? !!this.selectedValue : !!this.selectedValue?.length;
  };

  private handleClickOutside = (event: MouseEvent) => {
    if (this.hasFocus && !this.el.contains(event.target as Node)) {
      this.hasFocus = false;
      typeof window !== 'undefined' && window.removeEventListener('click', this.handleClickOutside);
    }
  };

  private handleClick = (e: MouseEvent) => {
    const targetId = (e.target as any).id ?? '';

    if (targetId === 'ignore-click') {
      return;
    }

    if (!this.disabled) {
      this.hasFocus = true;
      typeof window !== 'undefined' && window.addEventListener('click', this.handleClickOutside);
    }
  };

  render() {
    const selectedValueAsString = Array.isArray(this.selectedValue) ? this.selectedValue.join(', ') : this.selectedValue;

    return (
      <Host id={this.id} class={{ 'disabled': this.disabled, 'focused': this.hasFocus, 'has-value': this.hasSelectedItem }}>
        {this.label && (
          <label class="label" htmlFor={this.inputId}>
            {this.label}
            {this.required ? '*' : ' '}
            {!this.required && this.showOptionalLabel ? <span class="optional-label">(optional)</span> : ''}
          </label>
        )}
        <div part="select-container" id="select-container" class={{ 'select-container': true, 'error-container': Boolean(this.errorText) }} onClick={this.handleClick}>
          {this.hasSelectedItem && this.showFormattedSelectedItem && <slot name="selected-item"></slot>}
          <div class={{ 'selected-container-content': true, 'hidden': this.hasSelectedItem && this.showFormattedSelectedItem }} id="selected-container-content" style={{}}>
            {(!this.hasSelectedItem || !this.showFormattedSelectedItem) && (
              <cpsl-text
                class={{ 'selected-text': true, 'placeholder': !this.selectedValue }}
                part="selected-text"
                color={this.selectedItemColor}
                variant={this.selectedItemVariant}
                weight={this.selectedItemWeight}
              >
                {!this.selectedValue ? (this.placeholder ?? 'Select') : (this.formatValue?.(this.selectedValue) ?? selectedValueAsString)}
              </cpsl-text>
            )}
          </div>
          {this.icon && this.icon !== null && (
            <cpsl-icon part="icon" class={{ 'chevron': true, 'open': !this.noIconAnimation && this.popoverOpen, 'has-value': this.hasSelectedItem }} icon={this.icon} />
          )}
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
          <cpsl-popover
            part="popover"
            autoWidth={this.autoWidth}
            alignCenter={this.alignCenter}
            trigger={this.id}
            preventBlur={this.hasFocus}
            disabled={this.disabled}
            anchorEl={this.anchorEl}
          >
            <div part="dropdown" class="dropdown">
              {this.showSearch && (
                <div class="search-container">
                  <cpsl-input
                    onClick={e => e.stopPropagation()}
                    placeholder={this.searchPlaceholder ?? 'Search'}
                    value=""
                    onCpslInput={e => {
                      e.stopPropagation();
                      this.cpslSearchChange.emit(e.detail.value);
                    }}
                  />
                </div>
              )}
              <div class="dropdown-inner" style={{ maxHeight: `${this.dropdownMaxHeight}px` }}>
                <slot name="items"></slot>
              </div>
            </div>
          </cpsl-popover>
        </div>
        {(this.errorText || this.helperText) && (
          <div class={{ 'helper-text-container': true, 'error-text': Boolean(this.errorText) }}>
            <span>{this.errorText ?? this.helperText}</span>
          </div>
        )}
      </Host>
    );
  }
}

let inputIds = 0;
