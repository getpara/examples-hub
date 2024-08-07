import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-slide-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-slide-button></cpsl-slide-button>');

    const element = await page.find('cpsl-slide-button');
    expect(element).toHaveClass('hydrated');
  });
});
