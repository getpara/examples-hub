import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-switch', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-switch></cpsl-switch>');

    const element = await page.find('cpsl-switch');
    expect(element).toHaveClass('hydrated');
  });
});
