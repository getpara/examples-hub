import { BuyAssets } from './BuyAssets';
import { DefaultAsset } from './DefaultAsset';
import { Providers } from './Providers';

export const BuyContent = () => {
  return (
    <>
      <Providers />
      <BuyAssets />
      <DefaultAsset />
    </>
  );
};
