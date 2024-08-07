import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-button></cpsl-button>');

    const element = await page.find('cpsl-button');
    expect(element).toHaveClass('hydrated');
  });
});
