import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-tile-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-tile-button></cpsl-tile-button>');

    const element = await page.find('cpsl-tile-button');
    expect(element).toHaveClass('hydrated');
  });
});
