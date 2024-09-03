import { newSpecPage } from '@stencil/core/testing';
import { CpslSwitch } from '../cpsl-switch';

describe('cpsl-switch', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslSwitch],
      html: `<cpsl-switch></cpsl-switch>`,
    });
    expect(page.root).toEqualHtml(`
     <cpsl-switch>
        <mock:shadow-root>
          <input type="checkbox">
          <span class="container">
            <span class="thumb"></span>
          </span>
        </mock:shadow-root>
      </cpsl-switch>
    `);
  });
});
