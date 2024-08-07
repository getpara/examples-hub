import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-avatar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-avatar></cpsl-avatar>');

    const element = await page.find('cpsl-avatar');
    expect(element).toHaveClass('hydrated');
  });
});
