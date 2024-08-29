import { Component, Host, h, Prop, Element, Event, EventEmitter } from '@stencil/core';
import { CodeChangeEventDetail } from './code-change-interface';

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

  private handleInput = (ind: number, ev: InputEvent) => {
    const inputElements = this.inputs;
    if (ev.inputType === 'insertText') {
      if (this.type === 'number' && isNaN(parseInt(ev.data))) {
        inputElements[ind].value = '';
        return;
      }
      inputElements[Math.min(this.length - 1, ind + 1)].focus();

      const newCode = `${this.code ?? ''}${ev.data}`;
      this.cpslInput.emit({ value: newCode });
      this.code = newCode;
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

  // TODO: figure out why pasting a string populates the first input
  private handlePaste = (e: ClipboardEvent) => {
    const inputElements = this.inputs;
    const pastedCode = e.clipboardData.getData('text');

    if (this.type === 'number' && isNaN(parseInt(pastedCode))) {
      // Remove illegal value from the first input. Not using a timeout here doesn't change the value properly.
      setTimeout(() => {
        inputElements[0].value = '';
      }, 0);
      return;
    }

    this.cpslInput.emit({
      value: pastedCode,
    });
    inputElements.forEach((input, index) => {
      input.value = pastedCode.charAt(index);
    });
    inputElements[this.length - 1].focus();
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
              class={{ 'code-input': true, 'error': Boolean(this.errorText) }}
              id={`code-input-${i}`}
              maxLength={1}
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
