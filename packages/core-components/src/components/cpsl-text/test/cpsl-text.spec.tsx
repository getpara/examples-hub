import { newSpecPage } from '@stencil/core/testing';
import { CpslText } from '../cpsl-text';

describe('cpsl-text', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslText],
      html: `<cpsl-text></cpsl-text>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-text>
        <mock:shadow-root>
          <p class="body-m primary" part="text-element">
            <slot></slot>
          </p>
        </mock:shadow-root>
      </cpsl-text>
    `);
  });
});
