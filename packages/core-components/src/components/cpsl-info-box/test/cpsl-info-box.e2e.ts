import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-info-box', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-info-box></cpsl-info-box>');

    const element = await page.find('cpsl-info-box');
    expect(element).toHaveClass('hydrated');
  });
});
