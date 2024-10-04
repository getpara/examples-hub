import { newSpecPage } from '@stencil/core/testing';
import { CpslSelect } from '../cpsl-select';

describe('cpsl-select', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslSelect],
      html: `<cpsl-select></cpsl-select>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-select id="cpsl-select-0-trigger">
        <mock:shadow-root>
          <div class="select-container" id="select-container" part="select-container">
            <div class="selected-container-content" id="selected-container-content">
            <cpsl-text class="placeholder selected-text">
                Select
              </cpsl-text>
            </div>
            <cpsl-icon class="chevron" icon="chevronUp" part="icon"></cpsl-icon>
            <input id="cpsl-select-0" inputmode="none">
            <cpsl-popover part="popover" trigger="cpsl-select-0-trigger">
              <div class="dropdown" part="dropdown">
                <div class="dropdown-inner" style="max-height: undefinedpx;">
                  <slot name="items"></slot>
                </div>
              </div>
            </cpsl-popover>
          </div>
        </mock:shadow-root>
      </cpsl-select>
    `);
  });
});
