import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-identicon', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-identicon></cpsl-identicon>');

    const element = await page.find('cpsl-identicon');
    expect(element).toHaveClass('hydrated');
  });
});
