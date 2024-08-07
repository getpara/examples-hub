import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-alert', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-alert></cpsl-alert>');

    const element = await page.find('cpsl-alert');
    expect(element).toHaveClass('hydrated');
  });
});
