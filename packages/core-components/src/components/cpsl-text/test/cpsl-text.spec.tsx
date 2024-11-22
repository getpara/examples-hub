import { newSpecPage } from '@stencil/core/testing';
import { CpslText } from '../cpsl-text.js';

describe('cpsl-text', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslText],
      html: `<cpsl-text></cpsl-text>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-text class="body-m primary">
        <mock:shadow-root>
          <p part="text-element">
            <slot></slot>
          </p>
        </mock:shadow-root>
      </cpsl-text>
    `);
  });
});
