# Release (Thu Apr 10 2025)

## Package Versions
- @getpara/web-sdk@1.10.0
- @getpara/wagmi-v2-integration@1.10.0
- @getpara/wagmi-v1-integration@1.10.0
- @getpara/viem-v2-integration@1.10.0
- @getpara/viem-v1-integration@1.10.0
- @getpara/user-management-client@1.10.0
- @getpara/solana-web3.js-v1-integration@1.10.0
- @getpara/solana-wallet-connectors@1.10.0
- @getpara/server-sdk@1.10.0
- @getpara/react-sdk@1.10.0
- @getpara/react-native-wallet@1.10.0
- @getpara/react-components@1.10.0
- @getpara/react-common@1.10.0
- @getpara/evm-wallet-connectors@1.10.0
- @getpara/ethers-v6-integration@1.10.0
- @getpara/ethers-v5-integration@1.10.0
- @getpara/cosmos-wallet-connectors@1.10.0
- @getpara/cosmjs-v0-integration@1.10.0
- @getpara/core-sdk@1.10.0
- @getpara/core-components@1.10.0

### Features
-  Onramp selection interface (#686) - 66d0c7b60

### Chores
-  EVM Connector - Remove noisy error (#834) - 2727fe4f1

### Tests
-  server-sdk unit tests (#838) - cc196e2c0
-  server example e2es (#832) - 2b9231ad6

# Release (Mon Apr 07 2025)

## Package Versions
- @getpara/web-sdk@1.9.0
- @getpara/wagmi-v2-integration@1.9.0
- @getpara/wagmi-v1-integration@1.9.0
- @getpara/viem-v2-integration@1.9.0
- @getpara/viem-v1-integration@1.9.0
- @getpara/user-management-client@1.9.0
- @getpara/solana-web3.js-v1-integration@1.9.0
- @getpara/solana-wallet-connectors@1.9.0
- @getpara/server-sdk@1.9.0
- @getpara/react-sdk@1.9.0
- @getpara/react-native-wallet@1.9.0
- @getpara/react-components@1.9.0
- @getpara/react-common@1.9.0
- @getpara/evm-wallet-connectors@1.9.0
- @getpara/ethers-v6-integration@1.9.0
- @getpara/ethers-v5-integration@1.9.0
- @getpara/cosmos-wallet-connectors@1.9.0
- @getpara/cosmjs-v0-integration@1.9.0
- @getpara/core-sdk@1.9.0
- @getpara/core-components@1.9.0

### Features
-  Add Solana off-ramping (#611) - bd970ae44
-  Allow wallet-free dev portal sign-in (#828) - ffb37fe1c

### Fixes
-  zustand holds state when not properly exited (#823) - 1b8f1f980
-  force single file for mpc workers (#830) - 5a5fe6217

### Chores
-  removing assetlinks.json file (#824) - 48f0d2b6a

# Release (Thu Apr 03 2025)

## Package Versions
- @getpara/web-sdk@1.8.0
- @getpara/wagmi-v2-integration@1.8.0
- @getpara/wagmi-v1-integration@1.8.0
- @getpara/viem-v2-integration@1.8.0
- @getpara/viem-v1-integration@1.8.0
- @getpara/user-management-client@1.8.0
- @getpara/solana-web3.js-v1-integration@1.8.0
- @getpara/solana-wallet-connectors@1.8.0
- @getpara/server-sdk@1.8.0
- @getpara/react-sdk@1.8.0
- @getpara/react-native-wallet@1.8.0
- @getpara/react-components@1.8.0
- @getpara/react-common@1.8.0
- @getpara/evm-wallet-connectors@1.8.0
- @getpara/ethers-v6-integration@1.8.0
- @getpara/ethers-v5-integration@1.8.0
- @getpara/cosmos-wallet-connectors@1.8.0
- @getpara/cosmjs-v0-integration@1.8.0
- @getpara/core-sdk@1.8.0
- @getpara/core-components@1.8.0


### Features
-  Add `createTestTransaction` function for each signer (#694) - 0cb06bcd
-  Add EVM Balances (#808) - d35b71e9

### Fixes
-  shorten link for qr code on login (#819) - a131fda8
-  skip compression for all package builds (#795) - 14964742

### Chores
-  Update phantom icons (#811) - 81e513fd
-  vulnerable deps upgrade (#733) - 469e8b53

# Release (Fri Mar 28 2025)

## Package Versions
- @getpara/core-components@1.7.1
- @getpara/core-sdk@1.7.1
- @getpara/cosmjs-v0-integration@1.7.1
- @getpara/cosmos-wallet-connectors@1.7.1
- @getpara/ethers-v5-integration@1.7.1
- @getpara/ethers-v6-integration@1.7.1
- @getpara/evm-wallet-connectors@1.7.1
- @getpara/react-common@1.7.1
- @getpara/react-components@1.7.1
- @getpara/react-native-wallet@1.7.1
- @getpara/react-sdk@1.7.1
- @getpara/server-sdk@1.7.1
- @getpara/solana-wallet-connectors@1.7.1
- @getpara/solana-web3.js-v1-integration@1.7.1
- @getpara/user-management-client@1.7.1
- @getpara/viem-v1-integration@1.7.1
- @getpara/viem-v2-integration@1.7.1
- @getpara/wagmi-v1-integration@1.7.1
- @getpara/wagmi-v2-integration@1.7.1
- @getpara/web-sdk@1.7.1


### Fixes
-  React-SDK Login polling regression (#804) - 51c670ea
-  EVM Connector - use useWalletState hook for evm connector (#805) - 2ed6e039
-  add fallback to return null on getter (#793) - 666f96ae
-  Dev Portal - Invalid routing and api noise (#800) - 9f6be905

# Release (Thu Mar 27 2025)

## Package Versions
- @getpara/core-components@1.7.0
- @getpara/core-sdk@1.7.0
- @getpara/cosmjs-v0-integration@1.7.0
- @getpara/cosmos-wallet-connectors@1.7.0
- @getpara/ethers-v5-integration@1.7.0
- @getpara/ethers-v6-integration@1.7.0
- @getpara/evm-wallet-connectors@1.7.0
- @getpara/react-common@1.7.0
- @getpara/react-components@1.7.0
- @getpara/react-native-wallet@1.7.0
- @getpara/react-sdk@1.7.0
- @getpara/server-sdk@1.7.0
- @getpara/solana-wallet-connectors@1.7.0
- @getpara/solana-web3.js-v1-integration@1.7.0
- @getpara/user-management-client@1.7.0
- @getpara/viem-v1-integration@1.7.0
- @getpara/viem-v2-integration@1.7.0
- @getpara/wagmi-v1-integration@1.7.0
- @getpara/wagmi-v2-integration@1.7.0
- @getpara/web-sdk@1.7.0

### Features
-  Full external wallet auth (#701) - d8698041
-  Add Safe EVM Connector (#789) - 02e412ea
-  Exclude signers on session export (#771) - b397ed37
-  React SDK - Add ens name display (#772) - 62dffa96
-  adding session max length to dev portal (#785) - cae2e0de
-  adding no email option (#788) - b9c880a3

### Fixes
-  setting login urls during auth login step (#791) - 1ef50d5d

### Chores
-  Update to new download-backup-kit route (#790) - 71026ee3

# Release (Thu Mar 20 2025)

## Package Versions
- @getpara/core-components@1.6.0
- @getpara/core-sdk@1.6.0
- @getpara/cosmjs-v0-integration@1.6.0
- @getpara/cosmos-wallet-connectors@1.6.0
- @getpara/ethers-v5-integration@1.6.0
- @getpara/ethers-v6-integration@1.6.0
- @getpara/evm-wallet-connectors@1.6.0
- @getpara/react-common@1.6.0
- @getpara/react-components@1.6.0
- @getpara/react-native-wallet@1.6.0
- @getpara/react-sdk@1.6.0
- @getpara/server-sdk@1.6.0
- @getpara/solana-wallet-connectors@1.6.0
- @getpara/solana-web3.js-v1-integration@1.6.0
- @getpara/user-management-client@1.6.0
- @getpara/viem-v1-integration@1.6.0
- @getpara/viem-v2-integration@1.6.0
- @getpara/wagmi-v1-integration@1.6.0
- @getpara/wagmi-v2-integration@1.6.0
- @getpara/web-sdk@1.6.0

### Features
-  update build to include package.json type (#783) - fcb0e486
-  OAuth account metadata (#769) - 25bf6b2b

### Fixes
-  Incorrect phone mask for Germany (#776) - 8811368c
-  Asset select dropdowns not displaying (#779) - cf73a120
-  set current wallet ids correctly on login (#768) - d05d769c
-  Portal deploy env vars (#777) - 636199c0
-  select all wallets on connect login (#722) - 8278677e
-  Portal excessive useEffect calls (#770) - fc0c5b17

### Chores
-  throw error to set shares (#775) - 30b0e66b

# Release (Thu Mar 13 2025)

## Package Versions
- @getpara/core-components@1.5.1
- @getpara/core-sdk@1.5.1
- @getpara/cosmjs-v0-integration@1.5.1
- @getpara/cosmos-wallet-connectors@1.5.1
- @getpara/ethers-v5-integration@1.5.1
- @getpara/ethers-v6-integration@1.5.1
- @getpara/evm-wallet-connectors@1.5.1
- @getpara/react-common@1.5.1
- @getpara/react-components@1.5.1
- @getpara/react-native-wallet@1.5.1
- @getpara/react-sdk@1.5.1
- @getpara/server-sdk@1.5.1
- @getpara/solana-wallet-connectors@1.5.1
- @getpara/solana-web3.js-v1-integration@1.5.1
- @getpara/user-management-client@1.5.1
- @getpara/viem-v1-integration@1.5.1
- @getpara/viem-v2-integration@1.5.1
- @getpara/wagmi-v1-integration@1.5.1
- @getpara/wagmi-v2-integration@1.5.1
- @getpara/web-sdk@1.5.1


### Fixes
-  use isUserVerifyingPlatformAuthenticatorAvailable to determine passkey support (#763) - c1df5ada
-  accept arraybuffer views for byte array types (#758) - eecd3a19
-  change build target to es2015 (#757) - edc1b5db

### Chores
-  Add changelog (#728) - fb73334a

# Release (Tue Feb 25 2025)

## Package Versions
- @getpara/core-components@1.4.1
- @getpara/core-sdk@1.4.1
- @getpara/cosmjs-v0-integration@1.4.1
- @getpara/cosmos-wallet-connectors@1.4.1
- @getpara/ethers-v5-integration@1.4.1
- @getpara/ethers-v6-integration@1.4.1
- @getpara/evm-wallet-connectors@1.4.1
- @getpara/react-common@1.4.1
- @getpara/react-components@1.4.1
- @getpara/react-native-wallet@1.4.1
- @getpara/react-sdk@1.4.1
- @getpara/server-sdk@1.4.1
- @getpara/solana-wallet-connectors@1.4.1
- @getpara/solana-web3.js-v1-integration@1.4.1
- @getpara/user-management-client@1.4.1
- @getpara/viem-v1-integration@1.4.1
- @getpara/viem-v2-integration@1.4.1
- @getpara/wagmi-v1-integration@1.4.1
- @getpara/wagmi-v2-integration@1.4.1
- @getpara/web-sdk@1.4.1

### Fixes
-  bare modal setIsModalMounted fix (#726) - 1820c125d
-  Issues with modal loops and ux (#649) - f01e52909
-  generic Android UA string (#699) - 71603d2d1
-  storage not syncing across tabs (#707) - 2c20ba1de

### Chores
-  clearer mpc errors (#720) - 1db5a84a1
-  add sentry to portal and sdks (#717) - 9c1987b15

