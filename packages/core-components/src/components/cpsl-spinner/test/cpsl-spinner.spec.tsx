import { newSpecPage } from '@stencil/core/testing';
import { CpslSpinner } from '../cpsl-spinner.js';

describe('cpsl-spinner', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslSpinner],
      html: `<cpsl-spinner></cpsl-spinner>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-spinner style="height: 54px; width: 54px; --bar-width: 6.4799999999999995px;">
        <mock:shadow-root>
          <div class="loader"></div>
        </mock:shadow-root>
      </cpsl-spinner>
    `);
  });
});
