import { Component, Host, Prop, h, Event, EventEmitter, State, Element, Watch } from '@stencil/core';
import { AutocompleteTypes, IconType, TextFieldTypes } from '../../interface';
import { InputChangeEventDetail, InputInputEventDetail } from './input-interface';
import Inputmask from 'inputmask';

@Component({
  tag: 'cpsl-input',
  styleUrl: 'cpsl-input.scss',
  shadow: true,
})
export class CpslInput {
  private nativeInput?: HTMLInputElement;
  @Element() el!: HTMLCpslInputElement;

  private inputId = `cpsl-input-${inputIds++}`;
  /**
   * The value of the input when the input is focused.
   */
  private focusedValue?: string | number | null;

  @State() hasFocus = false;

  /**
   * Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user.
   * Available options: `"off"`, `"none"`, `"on"`, `"sentences"`, `"words"`, `"characters"`.
   */

  @Prop() autocapitalize = 'off';

  /**
   * Indicates whether the value of the control can be automatically completed by the browser.
   */
  @Prop() autocomplete: AutocompleteTypes = 'off';

  /**
   * Whether auto correction should be enabled when the user is entering/editing the text value.
   */
  @Prop() autocorrect: 'on' | 'off' = 'off';

  /**
   * Whether to disable auto disabling of the slotted components.
   */
  @Prop() noAutoDisable: boolean;

  /**
   * Sets the [`autofocus` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus) on the native input element.
   *
   * This may not be sufficient for the element to be focused on page load.
   */

  @Prop() autofocus = false;

  /**
   * If `true`, the input's entire contents will be selected on focus.
   */
  @Prop() autoselect = false;

  /**
   * If `true`, the user cannot interact with the input.
   */
  @Prop() disabled = false;

  /**
   * If `true`, the input primary color will use the contrast value, not the primary text value.
   */
  @Prop() contrastText = false;

  /**
   * A hint to the browser for which enter key to display.
   * Possible values: `"enter"`, `"done"`, `"go"`, `"next"`,
   * `"previous"`, `"search"`, and `"send"`.
   */

  @Prop() enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /**
   * Error text to show below the input. If this is provided the input will enter an error state.
   */
  @Prop() errorText?: string;

  /**
   * Mask string to apply to the input.
   */
  @Prop() mask?: string;

  /**
   * Helper text to show below the input. If `"errorText"` is provided that will take precedence.
   */
  @Prop() helperText?: string;

  /**
   * A hint to the browser for which keyboard to display.
   * Possible values: `"none"`, `"text"`, `"tel"`, `"url"`,
   * `"email"`, `"numeric"`, `"decimal"`, and `"search"`.
   */

  @Prop() inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

  /**
   * The label for the input.
   */
  @Prop() label?: string;

  /**
   * The maximum value, which must not be less than its minimum (min attribute) value.
   */
  @Prop() max?: string | number;

  /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the maximum number of characters that the user can enter.
   */
  @Prop() maxlength?: number;

  /**
   * The minimum value, which must not be greater than its maximum (max attribute) value.
   */
  @Prop() min?: string | number;

  /**
   * If the value of the type attribute is `text`, `email`, `search`, `password`, `tel`, or `url`, this attribute specifies the minimum number of characters that the user can enter.
   */
  @Prop() minlength?: number;

  /**
   * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"`, otherwise it is ignored.
   */
  @Prop() multiple?: boolean;

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string = this.inputId;

  /**
   * A regular expression that the value is checked against. The pattern must match the entire value, not just some subset. Use the title attribute to describe the pattern to help the user. This attribute applies when the value of the type attribute is `"text"`, `"search"`, `"tel"`, `"url"`, `"email"`, `"date"`, or `"password"`, otherwise it is ignored. When the type attribute is `"date"`, `pattern` will only be used in browsers that do not support the `"date"` input type natively. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date for more information.
   */
  @Prop() pattern?: string;

  /**
   * Instructional text that shows before the input has a value.
   * This property applies only when the `type` property is set to `"email"`,
   * `"number"`, `"password"`, `"search"`, `"tel"`, `"text"`, or `"url"`, otherwise it is ignored.
   */
  @Prop() placeholder?: string;

  /**
   * If `true`, the user cannot modify the value.
   */
  @Prop() readonly = false;

  /**
   * If `true`, the user must fill in a value before submitting a form.
   */
  @Prop() required = false;

  /**
   * If `true`, the label will display an "optional" tag.
   */
  @Prop() showOptionalLabel = false;

  /**
   * If `true`, the element will have its spelling and grammar checked.
   */

  @Prop() spellcheck = false;

  /**
   * The external source of the icon at the start of the input. If both `startIcon` and `startIconSrc` are provided, `startIcon` will be used.
   */
  @Prop() startIconSrc?: string;

  /**
   * The name of the icon at the start of the input. If both `startIcon` and `startIconSrc` are provided, `startIcon` will be used.
   */
  @Prop() startIcon?: IconType;

  /**
   * Works with the min and max attributes to limit the increments at which a value can be set.
   * Possible values are: `"any"` or a positive floating point number.
   */
  @Prop() step?: string;

  /**
   * The type of control to display. The default type is `text`.
   */
  @Prop() type: TextFieldTypes = 'text';

  /**
   * The value of the controlled input.
   */
  @Prop({ mutable: true }) value?: string;

  /**
   * The `cpslInput` event is fired each time the user modifies the input's value.
   * Unlike the `cpslChange` event, the `cpslInput` event is fired for each alteration
   * to the input's value. This typically happens for each keystroke as the user types.
   *
   * For elements that accept text input (`type=text`, `type=tel`, etc.), the interface
   * is [`InputEvent`](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent); for others,
   * the interface is [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event). If
   * the input is cleared on edit, the type is `null`.
   */
  @Event() cpslInput!: EventEmitter<InputInputEventDetail>;

  /**
   * The `cpslChange` event is fired when the user modifies the input's value.
   * Unlike the `cpslInput` event, the `cpslChange` event is only fired when changes
   * are committed, not as the user types.
   *
   * Depending on the way the users interacts with the element, the `cpslChange`
   * event fires at a different moment:
   * - When the element loses focus after its value has changed: for elements
   * where the user's interaction is typing.
   */
  @Event() cpslChange!: EventEmitter<InputChangeEventDetail>;

  /**
   * Emitted when the input loses focus.
   */
  @Event() cpslBlur!: EventEmitter<FocusEvent>;

  /**
   * Emitted when the input has focus.
   */
  @Event() cpslFocus!: EventEmitter<FocusEvent>;

  /**
   * Emitted when something has been paste into the input.
   */
  @Event() cpslPaste!: EventEmitter<ClipboardEvent>;

  @Watch('disabled')
  handleDisable() {
    if (this.disabled) {
      this.disableSlots();
    } else {
      this.enableSlots();
    }
  }

  @Watch('mask')
  handleSetupMask() {
    if (this.nativeInput) {
      if (this.mask) {
        Inputmask({ mask: this.mask, showMaskOnHover: false }).mask(this.nativeInput);
        (this.nativeInput as any).inputmask.shadowRoot = this.el.shadowRoot;
      } else {
        if ((this.nativeInput as any).inputmask) {
          (this.nativeInput as any).inputmask.remove();
        }
        this.nativeInput.value = this.value ?? '';
      }
    }
  }

  @Watch('value')
  handleValueChange() {
    if (!this.value) {
      this.nativeInput.value = this.value ?? '';
    }
  }

  componentDidLoad() {
    this.initButtons();
    if (this.value) {
      this.enableSlots();
    } else {
      this.disableSlots();
    }

    this.handleSetupMask();
  }

  private disableSlots() {
    if (!this.noAutoDisable) {
      this.endEl?.setAttribute('disabled', 'true');
      this.startEl?.setAttribute('disabled', 'true');
    }
  }

  private enableSlots() {
    this.endEl?.setAttribute('disabled', 'false');
    this.startEl?.setAttribute('disabled', 'false');
  }

  private initButtons() {
    if (this.endEl?.tagName === 'CPSL-BUTTON') {
      this.endEl.setAttribute('full-width', 'true');
      this.endEl.addEventListener('mousedown', e => {
        e.preventDefault();
      });
    }
    if (this.startEl?.tagName === 'CPSL-BUTTON') {
      this.startEl.setAttribute('full-width', 'true');
      this.startEl.addEventListener('mousedown', e => {
        e.preventDefault();
      });
    }
  }

  /**
   * Emits a `cpslInput` event.
   */
  private emitInputChange(event?: Event) {
    this.cpslInput.emit({ value: this.value || '', event });
  }

  /**
   * Emits a `cpslChange` event.
   *
   * This API should be called for user committed changes.
   * This API should not be used for external value changes.
   */
  private emitValueChange(event?: Event) {
    const { value } = this;
    // Checks for both null and undefined values
    const newValue = value == null ? value : value.toString();
    // Emitting a value change should update the internal state for tracking the focused value
    this.focusedValue = newValue;
    this.cpslChange.emit({ value: newValue, event });
  }

  private onInput = (ev: InputEvent) => {
    const input = ev.target as HTMLInputElement | null;

    let _value = input.value || '';
    if ((input as any).inputmask) _value = (input as any).inputmask.unmaskedvalue();

    if (Boolean(input)) {
      this.value = _value;
      input.value === '' ? this.disableSlots() : this.enableSlots();
    }

    this.emitInputChange(ev);
  };

  private onChange = (ev: Event) => {
    this.emitValueChange(ev);
  };

  private onBlur = (ev: FocusEvent) => {
    this.hasFocus = false;

    if (this.focusedValue !== this.value) {
      /**
       * Emits the `cpslChange` event when the input value
       * is different than the value when the input was focused.
       */
      this.emitValueChange(ev);
    }

    this.cpslBlur.emit(ev);
  };

  private onFocus = (ev: FocusEvent) => {
    this.hasFocus = true;
    this.focusedValue = this.value;

    this.autoselect && (ev.target as HTMLInputElement).select();

    this.cpslFocus.emit(ev);
  };

  private onPaste = (ev: ClipboardEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    const input = ev.target as HTMLInputElement;
    const pasteData = ev.clipboardData?.getData('text') || '';

    // Manually set the value & cursor position
    const initialSelectionStart = input.selectionStart;
    const newVal = `${input.value.slice(0, input.selectionStart)}${pasteData}${input.value.slice(input.selectionEnd, input.value.length)}`;
    input.value = newVal;

    // this.value = newVal;
    input.selectionEnd = initialSelectionStart + pasteData.length;

    let _value = input.value || '';
    if ((input as any).inputmask) _value = (input as any).inputmask.unmaskedvalue();

    this.value = _value;

    this.value === '' ? this.disableSlots() : this.enableSlots();

    // Emit the cpslPaste event
    this.cpslPaste.emit(ev);

    // Emit the cpslChange event since the value was modified by paste
    this.emitInputChange(ev);
  };

  private focusInput = () => {
    this.nativeInput.focus();
  };

  private get startEl() {
    return this.el.querySelector('[slot="start"]');
  }

  private get endEl() {
    return this.el.querySelector('[slot="end"]');
  }

  render() {
    return (
      <Host class={{ 'disabled': this.disabled, 'focused': this.hasFocus, 'has-value': Boolean(this.focusedValue) || Boolean(this.value), 'contrast-text': this.contrastText }}>
        {this.label && (
          <label class="label" htmlFor={this.inputId}>
            {this.label}
            {this.required ? '*' : ' '}
            {!this.required && this.showOptionalLabel ? <span class="optional-label">(optional)</span> : ''}
          </label>
        )}
        <div class={{ 'input-container': true, 'error-container': Boolean(this.errorText) }}>
          <slot name="start"></slot>
          <input
            class="native-input"
            part="native-input"
            ref={input => (this.nativeInput = input)}
            id={this.inputId}
            disabled={this.disabled}
            autoCapitalize={this.autocapitalize}
            autoComplete={this.autocomplete}
            autoCorrect={this.autocorrect}
            autoFocus={this.autofocus}
            enterKeyHint={this.enterkeyhint}
            inputMode={this.inputmode}
            min={this.min}
            max={this.max}
            minLength={this.minlength}
            maxLength={this.maxlength}
            multiple={this.multiple}
            name={this.name}
            pattern={this.pattern}
            placeholder={this.placeholder || ''}
            readOnly={this.readonly}
            required={this.required}
            spellcheck={this.spellcheck}
            type={this.type}
            value={this.value ?? ''}
            onInput={this.onInput}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onClick={this.focusInput}
            onPaste={this.onPaste}
          />
          <slot name="end"></slot>
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
