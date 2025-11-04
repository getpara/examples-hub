import { Component, Host, h, Prop, Element, Event, EventEmitter, Watch } from '@stencil/core';
import { CodeChangeEventDetail } from './code-change-interface.js';

@Component({
  tag: 'cpsl-code-input',
  styleUrl: 'cpsl-code-input.scss',
  shadow: true,
})
export class CpslCodeInput {
  @Element() el!: HTMLCpslCodeInputElement;

  /**
   * Value of the code.
   */

  @Prop({ mutable: true }) code: string;

  /**
   * Error text to show below the input. If this is provided the input will enter an error state.
   */
  @Prop() errorText?: string;

  /**
   * Helper text to show below the input. If `"errorText"` is provided that will take precedence.
   */
  @Prop() helperText?: string;

  /**
   * Length of the code.
   */
  @Prop() length: number;

  /**
   * Type of characters to accept in the code.
   * Defaults to number.
   */
  @Prop() type?: 'number' | 'string' = 'number';

  /**
   * The `cpslInput` event is fired each time the user modifies the input's value.
   */
  @Event() cpslInput!: EventEmitter<CodeChangeEventDetail>;

  @Watch('code')
  watchCodeProp(newCode: string) {
    // Update the input values when the code prop changes externally
    const inputElements = this.inputs;
    if (inputElements.length > 0) {
      inputElements.forEach((input, index) => {
        input.value = newCode?.[index] || '';
      });
    }
  }
  private handleInput = (ind: number, ev: InputEvent) => {
    const inputElements = this.inputs;

    // If getting an insertFromPaste remove the last element value since the value setting is handled in the paste event
    if (ev.inputType === 'insertFromPaste') {
      inputElements[Math.min(this.length - 1, ind)].value = '';
      return;
    }

    if (ev.inputType === 'insertText') {
      if (this.type === 'number' && isNaN(parseInt(ev.data))) {
        ev.preventDefault();
        inputElements[ind].value = '';
        return;
      }

      // Prevent the default behavior FIRST
      ev.preventDefault();

      // Build the new code from the current component state, not the DOM
      const currentCode = this.code || '';

      // Prevent input beyond the maximum length
      if (currentCode.length >= this.length) {
        return;
      }

      // Insert the new character at the correct position
      const newCode = currentCode + ev.data;

      // Update the component state and emit event
      this.cpslInput.emit({ value: newCode });
      this.code = newCode;

      // Update the specific input that was typed in
      inputElements[ind].value = ev.data;

      // Focus next input if not at the end
      if (newCode.length < this.length) {
        inputElements[newCode.length].focus();
      }
    }
  };

  private handleKeyDown = (ind: number, ev: KeyboardEvent) => {
    const inputElements = this.inputs;

    switch (ev.key) {
      case 'Backspace': {
        let newCode;
        if (!inputElements[ind].value) {
          inputElements[Math.max(0, ind - 1)].value = '';
          inputElements[Math.max(0, ind - 1)].focus();
          newCode = this.code.substring(0, ind - 1);
        } else {
          newCode = this.code.substring(0, ind);
        }
        this.cpslInput.emit({ value: newCode });
        this.code = newCode;
        break;
      }
      case 'ArrowLeft': {
        setTimeout(() => {
          this.inputs[ind].setSelectionRange(1, 1);
        }, 0);
        break;
      }
      default: {
        break;
      }
    }
  };

  private handleFocus = (ind: number) => {
    const inputElements = this.inputs;

    for (const input of inputElements) {
      if (!input.value) {
        input.focus();
        break;
      } else if (input.id === `code-input-${this.length - 1}`) {
        input.focus();
        break;
      }
    }

    setTimeout(() => {
      inputElements[ind].setSelectionRange(1, 1);
    }, 0);
  };

  private handlePaste = (e: ClipboardEvent) => {
    const inputElements = this.inputs;
    let pastedCode = e.clipboardData.getData('text');

    // Filter based on type
    if (this.type === 'number') {
      // Remove all non-numeric characters
      pastedCode = pastedCode.replace(/\D/g, '');

      // If no valid numbers remain, clear and return
      if (!pastedCode) {
        setTimeout(() => {
          inputElements[0].value = '';
        }, 0);
        return;
      }
    }

    // Truncate pasted code to match the expected length
    const truncatedCode = pastedCode.substring(0, this.length);

    this.cpslInput.emit({
      value: truncatedCode,
    });

    inputElements.forEach((input, index) => {
      input.value = truncatedCode.charAt(index) || '';
    });

    inputElements[Math.min(this.length - 1, truncatedCode.length)].focus();
  };

  private get inputs() {
    return Array.from(this.el.shadowRoot.querySelectorAll('input'));
  }

  render() {
    return (
      <Host>
        <div class="code-container">
          {new Array(this.length).fill(0).map((_, i) => (
            <input
              class={{ 'code-input': true, 'error': Boolean(this.errorText), 'has-value': this.code?.[i] !== undefined }}
              id={`code-input-${i}`}
              onKeyDown={ev => this.handleKeyDown(i, ev)}
              onInput={ev => this.handleInput(i, ev)}
              onFocus={() => this.handleFocus(i)}
              onPaste={this.handlePaste}
              min={0}
              max={9}
              value={this.code?.[i]}
              inputMode={this.type === 'number' ? 'numeric' : 'text'}
            />
          ))}
        </div>
        {(this.errorText || this.helperText) && (
          <div class={{ 'helper-text-container': true, 'error-text': Boolean(this.errorText) }}>
            <cpsl-icon icon={this.errorText ? 'alertCircle' : 'infoCircle'} />
            <span>{this.errorText ?? this.helperText}</span>
          </div>
        )}
      </Host>
    );
  }
}
