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
            <cpsl-icon icon="alertCircle"></cpsl-icon>
            <slot></slot>
          </div>
        </mock:shadow-root>
      </cpsl-alert>
    `);
  });
});
