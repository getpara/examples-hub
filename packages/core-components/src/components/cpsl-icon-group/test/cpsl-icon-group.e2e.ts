import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-icon-group', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-icon-group></cpsl-icon-group>');

    const element = await page.find('cpsl-icon-group');
    expect(element).toHaveClass('hydrated');
  });
});
