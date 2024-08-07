import { newSpecPage } from '@stencil/core/testing';
import { CpslCol } from '../cpsl-col';

describe('cpsl-col', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslCol],
      html: `<cpsl-col></cpsl-col>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-col>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </cpsl-col>
    `);
  });
});
