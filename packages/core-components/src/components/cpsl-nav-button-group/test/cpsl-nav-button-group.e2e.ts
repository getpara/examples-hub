import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-nav-button-group', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-nav-button-group></cpsl-nav-button-group>');

    const element = await page.find('cpsl-nav-button-group');
    expect(element).toHaveClass('hydrated');
  });
});
