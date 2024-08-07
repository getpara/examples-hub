import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-tab', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-tab></cpsl-tab>');

    const element = await page.find('cpsl-tab');
    expect(element).toHaveClass('hydrated');
  });
});
