import { newSpecPage } from '@stencil/core/testing';
import { CpslSlideButton } from '../cpsl-slide-button';

describe('cpsl-slide-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslSlideButton],
      html: `<cpsl-slide-button></cpsl-slide-button>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-slide-button>
        <mock:shadow-root>
          <div class="slider-container" id="slider-container">
            <div class="slider-container-background start-slider-container-background" id="start-slider-container-background"></div>
            <div class="end-slider-container-background slider-container-background" id="end-slider-container-background"></div>
            <div class="slider" id="slider">
              <cpsl-icon class="icon start-icon" id="start-icon"></cpsl-icon>
              <cpsl-icon class="end-icon icon" id="end-icon"></cpsl-icon>
            </div>
            <span class="start-text" id="start-text"></span>
            <span class="end-text" id="end-text"></span>
          </div>
        </mock:shadow-root>
      </cpsl-slide-button>
    `);
  });
});
