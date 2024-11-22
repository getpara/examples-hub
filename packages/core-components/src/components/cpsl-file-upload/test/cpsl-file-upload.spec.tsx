import { newSpecPage } from '@stencil/core/testing';
import { CpslFileUpload } from '../cpsl-file-upload.js';

describe('cpsl-file-upload', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslFileUpload],
      html: `<cpsl-file-upload></cpsl-file-upload>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-file-upload>
        <mock:shadow-root>
          <slot name="label"></slot>
          <div class="container">
            <div class="label-container">
              <slot name="left-content"></slot>
            </div>
            <div class="file-container">
              <cpsl-icon icon="image"></cpsl-icon>
              <span class="sample-image-name-container">
                <cpsl-text class="sample-image-name" variant="bodyXS">
                  Drag file here or
                  <cpsl-text class="inline-text" variant="bodyXS">
                    upload file
                  </cpsl-text>
                </cpsl-text>
              </span>
            </div>
            <input accept="*" id="cpsl-file-upload-0" type="file">
          </div>
        </mock:shadow-root>
      </cpsl-file-upload>
    `);
  });
});
