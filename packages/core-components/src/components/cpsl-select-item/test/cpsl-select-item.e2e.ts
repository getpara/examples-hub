import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-select-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-select-item></cpsl-select-item>');

    const element = await page.find('cpsl-select-item');
    expect(element).toHaveClass('hydrated');
  });
});
