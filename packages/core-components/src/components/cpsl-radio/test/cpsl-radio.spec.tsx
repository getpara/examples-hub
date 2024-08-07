import { newSpecPage } from '@stencil/core/testing';
import { CpslRadio } from '../cpsl-radio';

describe('cpsl-radio', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslRadio],
      html: `<cpsl-radio></cpsl-radio>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-radio>
        <mock:shadow-root>
          <input type="radio">
          <span class="container"></span>
        </mock:shadow-root>
      </cpsl-radio>
    `);
  });
});
