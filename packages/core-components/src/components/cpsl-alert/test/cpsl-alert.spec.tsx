import { newSpecPage } from '@stencil/core/testing';
import { CpslAlert } from '../cpsl-alert';

describe('cpsl-alert', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslAlert],
      html: `<cpsl-alert></cpsl-alert>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-alert class="error">
        <mock:shadow-root>
          <div class="alert-container">
            <div class="title-container">
              <cpsl-icon icon="alertCircle"></cpsl-icon>
              <slot></slot>
            </div>
            <slot name="subtitle"></slot>
          </div>
        </mock:shadow-root>
      </cpsl-alert>
    `);
  });
});
