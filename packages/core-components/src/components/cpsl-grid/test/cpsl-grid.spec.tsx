import { newSpecPage } from '@stencil/core/testing';
import { CpslGrid } from '../cpsl-grid.js';

describe('cpsl-grid', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslGrid],
      html: `<cpsl-grid></cpsl-grid>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-grid>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </cpsl-grid>
    `);
  });
});
