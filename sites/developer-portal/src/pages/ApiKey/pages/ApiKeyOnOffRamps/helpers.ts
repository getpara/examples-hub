import { getAssetCode, getNetworkName } from '@getpara/react-sdk';

export const parseAssetOption = (option: string) => {
  const [asset, network] = option.split('-');

  return { asset, network };
};

export const formatAssetOptionName = (option: string) => {
  const { asset, network } = parseAssetOption(option);

  return `${getAssetCode(asset)} (${getNetworkName(network)})`;
};

export const formatAssetOption = (asset: string, network: string) => `${asset}-${network}`;

export const renameObjKey = ({ oldObj, oldKey, newKey }: { oldObj: object; oldKey: string; newKey: string }) => {
  const keys = Object.keys(oldObj);
  const newObj = keys.reduce((acc, val) => {
    if (val === oldKey) {
      acc[newKey] = oldObj[oldKey];
    } else {
      acc[val] = oldObj[val];
    }
    return acc;
  }, {});

  return newObj;
};
