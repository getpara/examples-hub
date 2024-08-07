import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-drawer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-drawer></cpsl-drawer>');

    const element = await page.find('cpsl-drawer');
    expect(element).toHaveClass('hydrated');
  });
});
