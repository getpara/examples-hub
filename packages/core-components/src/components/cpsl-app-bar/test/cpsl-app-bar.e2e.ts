import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-app-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-app-bar></cpsl-app-bar>');

    const element = await page.find('cpsl-app-bar');
    expect(element).toHaveClass('hydrated');
  });
});
