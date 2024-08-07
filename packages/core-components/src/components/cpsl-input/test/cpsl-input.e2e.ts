import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-input></cpsl-input>');

    const element = await page.find('cpsl-input');
    expect(element).toHaveClass('hydrated');
  });
});
