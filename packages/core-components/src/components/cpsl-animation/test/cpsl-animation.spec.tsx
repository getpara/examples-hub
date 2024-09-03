import { newSpecPage } from '@stencil/core/testing';
import { CpslAnimation } from '../cpsl-animation';

describe('cpsl-animation', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslAnimation],
      html: `<cpsl-animation></cpsl-animation>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-animation>
        <mock:shadow-root>
         <div class="animation-container" id="animation-container" part="animation-container"></div>
        </mock:shadow-root>
      </cpsl-animation>
    `);
  });
});
