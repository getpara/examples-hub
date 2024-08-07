import { newSpecPage } from '@stencil/core/testing';
import { CpslCheckbox } from '../cpsl-checkbox';

describe('cpsl-checkbox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslCheckbox],
      html: `<cpsl-checkbox></cpsl-checkbox>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-checkbox>
        <mock:shadow-root>
          <input type="checkbox">
          <span class="container">
            <cpsl-icon icon="check"></cpsl-icon>
          </span>
        </mock:shadow-root>
      </cpsl-checkbox>
    `);
  });
});
