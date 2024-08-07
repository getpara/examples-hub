import { newSpecPage } from '@stencil/core/testing';
import { CpslInfoBox } from '../cpsl-info-box';

describe('cpsl-info-box', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslInfoBox],
      html: `<cpsl-info-box></cpsl-info-box>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-info-box>
        <mock:shadow-root>
          <div class="info-box-container">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </cpsl-info-box>
    `);
  });
});
