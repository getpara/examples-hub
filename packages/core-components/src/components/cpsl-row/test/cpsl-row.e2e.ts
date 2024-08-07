import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-row', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-row></cpsl-row>');

    const element = await page.find('cpsl-row');
    expect(element).toHaveClass('hydrated');
  });
});
