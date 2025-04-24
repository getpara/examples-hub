import { PregenConfiguration } from './PregenConfiguration/PregenConfiguration';
import { NativePasskeyConfiguration } from './NativePasskeyConfiguration/NativePasskeyConfiguration';

export const ConfigurationTab = () => {
  return (
    <>
      <NativePasskeyConfiguration />
      <PregenConfiguration />
      {/* TODO: Add this back once BE is complete */}
      {/* <NativePasskeyConfiguration /> */}
    </>
  );
};
