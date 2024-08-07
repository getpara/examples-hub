import { newSpecPage } from '@stencil/core/testing';
import { CpslInput } from '../cpsl-input';

describe('cpsl-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslInput],
      html: `<cpsl-input></cpsl-input>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-input>
        <mock:shadow-root>
          <div class="input-container">
            <slot name="start"></slot>
            <input autocapitalize="off" autocomplete="off" autocorrect="off" class="native-input" id="cpsl-input-0" name="cpsl-input-0" placeholder="" type="text">
            <slot name="end"></slot>
          </div>
        </mock:shadow-root>
      </cpsl-input>
    `);
  });
});
