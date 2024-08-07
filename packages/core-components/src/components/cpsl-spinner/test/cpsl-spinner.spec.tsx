import { newSpecPage } from '@stencil/core/testing';
import { CpslSpinner } from '../cpsl-spinner';

describe('cpsl-spinner', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslSpinner],
      html: `<cpsl-spinner></cpsl-spinner>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-spinner style="height: 54px; width: 54px; animation: spin 1s linear infinite; -webkit-animation: spin 1s linear infinite; -moz-animation: spin 1s linear infinite;">
        <mock:shadow-root>
          <svg fill="none" height="54" viewBox="0 0 54 54" width="54" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.1586 17C39.8082 11.5978 33.8243 8 27 8C16.5066 8 8 16.5066 8 27C8 37.4934 16.5066 46 27 46C33.8242 46 39.8082 42.4022 43.1586 37" stroke-linecap="round" stroke-width="6"></path>
            <circle cx="45" cy="27" r="5"></circle>
          </svg>
        </mock:shadow-root>
      </cpsl-spinner>
    `);
  });
});
