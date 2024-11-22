import { newSpecPage } from '@stencil/core/testing';
import { CpslDivider } from '../cpsl-divider.js';

describe('cpsl-divider', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslDivider],
      html: `<cpsl-divider></cpsl-divider>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-divider>
        <mock:shadow-root>
          <div></div>
            <slot></slot>
          <div></div>
        </mock:shadow-root>
      </cpsl-divider>
    `);
  });
});
