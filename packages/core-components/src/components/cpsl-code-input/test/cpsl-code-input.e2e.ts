import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-code-input', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-code-input></cpsl-code-input>');

    const element = await page.find('cpsl-code-input');
    expect(element).toHaveClass('hydrated');
  });
});
