import { Component, Host, Prop, Event, h, EventEmitter, State, Fragment, Element } from '@stencil/core';

@Component({
  tag: 'cpsl-file-upload',
  styleUrl: 'cpsl-file-upload.scss',
  shadow: true,
})
export class CpslFileUpload {
  @Element() el!: HTMLCpslFileUploadElement;

  private inputId = `cpsl-file-upload-${inputIds++}`;

  @State() file?: File;
  @State() dragOver?: boolean;
  @State() dragError?: boolean;
  @State() isUploading?: boolean;
  @State() uploadError?: boolean;

  /**
   * Error text to show below the input. If this is provided the input will enter an error state.
   */
  @Prop() errorText?: string;

  /**
   * Filename for the external source of the selected file.
   */
  @Prop() externalFilename?: string;

  /**
   * External source for the selected file.
   */
  @Prop() externalSrc?: string;

  /**
   * Valid file types.
   */
  @Prop() fileTypes?: string[];

  /**
   * Helper text to show below the input. If `"errorText"` is provided that will take precedence.
   */
  @Prop() helperText?: string;

  /**
   * The label for the input.
   */
  @Prop() label?: string;

  /**
   * If `true`, the user must fill in a value before submitting a form.
   */
  @Prop() required = false;

  /**
   * If `true`, the label will display an "optional" tag.
   */
  @Prop() showOptionalLabel = false;

  /**
   * Function to trigger file upload to server.
   * Returns: boolean indicating success or failure.
   */
  @Prop() uploadFile?: (file: File) => Promise<boolean>;

  /**
   * Emitted when the file is dropped in the input.
   */
  @Event() cpslOnDrop!: EventEmitter<DragEvent>;

  /**
   * Emitted when the file drag enters the input.
   */
  @Event() cpslOnDragEnter!: EventEmitter<DragEvent>;

  /**
   * Emitted when the file drag leaves the input.
   */
  @Event() cpslOnDragLeave!: EventEmitter<DragEvent>;

  /**
   * Emitted when the file changes.
   */
  @Event() cpslFileChange!: EventEmitter<File>;

  /**
   * Emitted when the file is removed.
   */
  @Event() cpslFileRemoved!: EventEmitter<void>;

  private handleDrop = async (ev: DragEvent) => {
    ev.preventDefault();

    const item = Array.from(ev.dataTransfer.items)?.[0];

    if (item && this.isValidFile(item.type)) {
      const file = item.getAsFile();
      await this.addFile(file);
    }

    this.dragOver = false;
    this.dragError = false;

    this.cpslOnDrop.emit(ev);
  };

  private handleDragEnter = (ev: DragEvent) => {
    ev.preventDefault();

    this.dragOver = true;

    const item = Array.from(ev.dataTransfer.items)?.[0];

    if (item && this.isValidFile(item.type)) {
      this.dragError = true;
    }

    this.cpslOnDragEnter.emit(ev);
  };

  private handleDragLeave = (ev: DragEvent) => {
    ev.preventDefault();

    this.dragOver = false;
    this.dragError = false;

    this.cpslOnDragLeave.emit(ev);
  };

  private handleInputChange = async (ev: Event) => {
    ev.preventDefault();

    const input = this.inputEl;

    if (input.files.length) {
      const file = input.files[0];

      if (this.isValidFile(file.type)) {
        await this.addFile(file);
      }
    }
  };

  private isValidFile = (type: string) => {
    if (this.fileTypes?.length ? !this.fileTypes.includes(type) : false) {
      return false;
    }

    return true;
  };

  private addFile = async (file: File) => {
    this.file = file;
    this.cpslFileChange.emit(file);
    this.uploadError = false;
    this.isUploading = true;
    const uploadSuccess = this.uploadFile ? await this.uploadFile(file) : true;
    if (!uploadSuccess) {
      this.uploadError = true;
      const input = this.inputEl;
      input.value = '';
    }
    this.isUploading = false;
  };

  private removeFile = (e: MouseEvent) => {
    e.preventDefault();

    this.file = undefined;

    const input = this.inputEl;
    input.value = '';

    this.cpslFileRemoved.emit();
  };

  get inputEl() {
    return this.el.shadowRoot.getElementById(this.inputId) as HTMLInputElement;
  }

  get FileContent() {
    const hasFile = Boolean(this.file) || Boolean(this.externalSrc);
    const isUploading = this.isUploading;
    const error = this.uploadError;

    const text = !hasFile ? (
      <Fragment>
        {'Drag file here or '}
        <cpsl-text class="inline-text" variant="bodyXS">
          upload file
        </cpsl-text>
      </Fragment>
    ) : isUploading ? (
      `${this.file.name} is uploading`
    ) : error ? (
      'Upload Failed'
    ) : (
      this.file?.name || this.externalFilename || ''
    );
    const TopElement = !hasFile ? (
      <cpsl-icon icon="image" />
    ) : isUploading ? (
      <cpsl-spinner />
    ) : error ? (
      <cpsl-icon icon="close" />
    ) : (
      <img class="sample-img" src={this.file ? URL.createObjectURL(this.file) : this.externalSrc} alt="Sample Image" />
    );

    return (
      <Fragment>
        {TopElement}
        <span class="sample-image-name-container">
          <cpsl-text class="sample-image-name" variant="bodyXS">
            {text}
          </cpsl-text>
          {hasFile && !error && !isUploading && <cpsl-icon icon="close" onClick={this.removeFile} />}
        </span>
      </Fragment>
    );
  }

  render() {
    return (
      <Host>
        {this.label && (
          <label class="label" htmlFor={this.inputId}>
            {this.label}
            {this.required ? '*' : ' '}
            {!this.required && this.showOptionalLabel ? <span class="optional-label">(optional)</span> : ''}
          </label>
        )}
        <slot name="label"></slot>
        <div class={{ 'container': true, 'error': Boolean(this.errorText), 'drag': this.dragOver, 'drag-error': this.dragError }}>
          <div class={{ 'label-container': true }}>
            <slot name="left-content"></slot>
          </div>
          <div class={{ 'file-container': true }}>{this.FileContent}</div>
          <input
            id={this.inputId}
            type="file"
            accept={this.fileTypes?.join(', ') ?? '*'}
            files={this.file ? [this.file] : undefined}
            onDrop={this.handleDrop}
            onDragEnter={this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
            onChange={this.handleInputChange}
          />
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
