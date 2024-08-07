import { newSpecPage } from '@stencil/core/testing';
import { CpslRow } from '../cpsl-row';

describe('cpsl-row', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslRow],
      html: `<cpsl-row></cpsl-row>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-row>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </cpsl-row>
    `);
  });
});
