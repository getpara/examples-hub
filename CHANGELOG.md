# Release (Thu Dec 04 2025)

## Package Versions
- @getpara/web-sdk@2.0.0
- @getpara/wagmi-v2-integration@2.0.0
- @getpara/wagmi-v2-connector@2.0.0
- @getpara/viem-v2-integration@2.0.0
- @getpara/viem-v1-integration@2.0.0
- @getpara/user-management-client@2.0.0
- @getpara/solana-web3.js-v1-integration@2.0.0
- @getpara/solana-wallet-connectors@2.0.0
- @getpara/solana-signers-v2-integration@2.0.0
- @getpara/server-sdk@2.0.0
- @getpara/react-sdk-lite@2.0.0
- @getpara/react-sdk@2.0.0
- @getpara/react-native-wallet@2.0.0
- @getpara/react-components@2.0.0
- @getpara/react-component-library@2.0.0
- @getpara/react-common@2.0.0
- @getpara/graz-integration@2.0.0
- @getpara/graz-connector@2.0.0
- @getpara/evm-wallet-connectors@2.0.0
- @getpara/ethers-v6-integration@2.0.0
- @getpara/ethers-v5-integration@2.0.0
- @getpara/cosmos-wallet-connectors@2.0.0
- @getpara/cosmjs-v0-integration@2.0.0
- @getpara/core-sdk@2.0.0
- @getpara/core-components@2.0.0

### Features
- embedded iframe styling for web portal on password login (#991) - d37cdca0c
- Add Solflare (#969) - c8228409d
- Dev portal - free tier (#930) - df0d0dac6
- Add Okx wallet (#928) - cbb72857a
- Add Android passkey verification status (#879) - 4fb0a010f
- add react-sdk prop tracking (#897) - 273b2c9e3
- Pull request review bot (#870) - e6a66ee0f
- Connection only external wallets (#874) - b62e055e2
- Add `createGuestWallets` method and helpers (#851) - 6a28527d3
- banner warning potential impact of slow wifi (#812) - b475c399b
- Communicate Apple Passkey registration status in dev portal (#839) - b446ff28a
- Onramp selection interface (#686) - 66d0c7b60
- Add Solana off-ramping (#611) - bd970ae44
- Allow wallet-free dev portal sign-in (#828) - ffb37fe1c
- Add `createTestTransaction` function for each signer (#694) - 0cb06bcd1
- Add EVM Balances (#808) - d35b71e93
- Full external wallet auth (#701) - d8698041c
- Add Safe EVM Connector (#789) - 02e412ea9
- Exclude signers on session export (#771) - b397ed37d
- React SDK - Add ens name display (#772) - 62dffa968
- adding session max length to dev portal (#785) - cae2e0dea
- adding no email option (#788) - b9c880a37
- update build to include package.json type (#783) - fcb0e486a
- OAuth account metadata (#769) - 25bf6b2b3
- override claimPregenWallets in server SDK and descriptive error messages (#755) - 41b4e2515
- Improved Bridge logging, granular try/catch, and restructured into files (#709) - 26edbe2bb
- full external wallet auth - mobile changes (#708) - 2549185ad

### Fixes
- Portal - White default background (#1072) - 1ee91f5b2
- resolve Claude PR review workflow skipping issue (#1035) - 3b8e5cd5e
- fix old account logins on new devices (#971) - 552ab659f
- Copy to in dev portal v1 (#965) - 9dd78d600
- solana auto connection issues (#954) - b0b0f4464
- Select item selection on mobile (#949) - 7d03b1689
- close on select search click (#947) - dacbec1c6
- Nigeria input mask (#946) - e69891a43
- add deeplinkUrl support for Farcaster login and simplify API response handling (#935) - 7ba637392
- structured clone import and shim import (#926) - 5fe166f7f
- Wagmi v1 - other missing viemChains calls (#936) - 679070783
- Remove deeplink URL validation in getOAuthURL (#934) - 0ecf0158a
- Wagmi V1 Connector - custom chain support (#931) - 496821104
- Skip passkey QR code on mobile (#927) - 1fbd9210e
- revert #909 peer dependency (#919) - fa815a0e0
- improve wallet balance hook falkiness (#917) - c0605c235
- React SDK loading Stripe scripts unnecessarily (#908) - 6f76bd6d7
- set peer dependency (#909) - bd297fdf7
- properly handle worker errors (#869) - 80e15204f
- Instruct Claude to use stdin for gh comments (#907) - 5bb56efea
- Dev Portal - origins empty string (#904) - b0bc79a69
- Portal - external wallet password creation (#903) - 56b35e634
- Update AddFundsReceive.tsx (#899) - 6c010184f
- add in missing sdk dependencies (#882) - 0aa7c7df6
- Modal builder asset screen CSS issue (#883) - d7659cc0b
- fix vulnerabilities check to work with publish PR (#865) - 72ef58786
- add structuredClone shim (#856) - 187af96b0
- Prevent unnecessary Apple passkey verification API calls (#848) - dcb87ac92
- Truncate receive address display (#844) - e8248f5cb
- zustand holds state when not properly exited (#823) - 1b8f1f980
- force single file for mpc workers (#830) - 5a5fe6217
- shorten link for qr code on login (#819) - a131fda8b
- skip compression for all package builds (#795) - 14964742e
- React-SDK Login polling regression (#804) - 51c670ead
- EVM Connector - use useWalletState hook for evm connector (#805) - 2ed6e0393
- add fallback to return null on getter (#793) - 666f96ae6
- Dev Portal - Invalid routing and api noise (#800) - 9f6be905f
- setting login urls during auth login step (#791) - 1ef50d5df
- Incorrect phone mask for Germany (#776) - 8811368c2
- Asset select dropdowns not displaying (#779) - cf73a120b
- set current wallet ids correctly on login (#768) - d05d769c7
- Portal deploy env vars (#777) - 636199c0a
- select all wallets on connect login (#722) - 8278677ed
- Portal excessive useEffect calls (#770) - fc0c5b176
- use isUserVerifyingPlatformAuthenticatorAvailable to determine passkey support (#763) - c1df5ada7
- accept arraybuffer views for byte array types (#758) - eecd3a191
- change build target to es2015 (#757) - edc1b5db4
- update password and and encrypted private key at the same time (#753) - 460b4ea3e
- Foreign phone display (#749) - 9f65451ac
- mobile qr code scan (#745) - cf39c7bd8
- add optional chaining for wallet property access (#747) - 29946495d
- pw login issue (#748) - ba0744180
- small fix for infinitely looping shortenLoginLink call (#742) - 4bcfaa51d
- polling for accounts to wagmi (#739) - 4c8023f80
- oauth creation routing (#740) - 2aa121dcd
- show qr code for passkey creation on portal if not supported (#735) - b1415b037
- TypeError from accessing undefined currentWalletIds (#736) - e3eafc2ad
- disable password submission (#724) - 6f28a8ae2
- useClient response type (#732) - 76119987a
- for oAuth not showing pw login option (#725) - 83a97c49e
- bare modal setIsModalMounted fix (#726) - 1820c125d
- Issues with modal loops and ux (#649) - f01e52909

### Chores
- Add portal loaded event (#1090) - 3c6ab9526
- Add portal close event (#1088) - e6545d67e
- Solana external connection improvements (#1029) - 33c805f0d
- Remove error throw on location hints (#1002) - ddfd318e6
- add solana signing retry functionality (#979) - 5117f8793
- Add Claude Code GitHub Workflow (#980) - 27a5e9984
- Update externalWalletsWithParaAuth prop name (#966) - 04d5a3816
- Add Secret API Key to dev portal (#960) - b39539523
- force setup-worker command to use correct go version for building wasm (#920) - 910954461
- Remove guest mode from 1.x (#901) - cea76aceb
- remove assert dependency (#878) - a9a7ddd0f
- improve sdk error tracking (#849) - aeeb8f796
- improved hot reload for running example and web portal locally (#855) - ec4301704
- Basic readme updates (#766) - 034e76d88
- Remove `qs` from sdk bundle (#857) - 410003e13
- update test email domain from test.usecapsule.com to test.getpara.com (#685) - 4ac2d04c7
- fix wagmi v2 version to latest (#850) - 5460779fa
- EVM Connector - Remove noisy error (#834) - 2727fe4f1
- removing assetlinks.json file (#824) - 48f0d2b6a
- Update phantom icons (#811) - 81e513fd2
- vulnerable deps upgrade (#733) - 469e8b532
- Update to new download-backup-kit route (#790) - 71026ee3c
- throw error to set shares (#775) - 30b0e66bf
- Add changelog (#728) - fb73334a2
- Remove `para.currentExternalWalletAddresses` (#752) - ae69412ac
- set minify to false for builds (#746) - 041273ad2
- Move isPasskeySupported function and export (#729) - 2318b9132
- clearer mpc errors (#720) - 1db5a84a1



### Refactors
- parallelize signing setup api calls to improve solana signing speed (#961) - 29458187e
- use persistent web worker and wasm for evm signing operations (#905) - 68b4218ea


### Tests
- Add testing for react native sdk (#959) - f38aa9625
- web portal unit tests (#840) - d40439016
- server-sdk unit tests (#838) - cc196e2c0
- server example e2es (#832) - 2b9231ad6

# Release (Thu Apr 24 2025)

## Package Versions
- @getpara/web-sdk@1.12.0
- @getpara/wagmi-v2-integration@1.12.0
- @getpara/wagmi-v1-integration@1.12.0
- @getpara/viem-v2-integration@1.12.0
- @getpara/viem-v1-integration@1.12.0
- @getpara/user-management-client@1.12.0
- @getpara/solana-web3.js-v1-integration@1.12.0
- @getpara/solana-wallet-connectors@1.12.0
- @getpara/server-sdk@1.12.0
- @getpara/react-sdk@1.12.0
- @getpara/react-native-wallet@1.12.0
- @getpara/react-components@1.12.0
- @getpara/react-common@1.12.0
- @getpara/evm-wallet-connectors@1.12.0
- @getpara/ethers-v6-integration@1.12.0
- @getpara/ethers-v5-integration@1.12.0
- @getpara/cosmos-wallet-connectors@1.12.0
- @getpara/cosmjs-v0-integration@1.12.0
- @getpara/core-sdk@1.12.0
- @getpara/core-components@1.12.0

### Features
-  Connection only external wallets (#874) - b62e055e2

### Fixes
-  add in missing sdk dependencies (#882) - 0aa7c7df6
-  Modal builder asset screen CSS issue (#883) - d7659cc0b
-  fix vulnerabilities check to work with publish PR (#865) - 72ef58786

### Chores
-  remove assert dependency (#878) - a9a7ddd0f
-  improve sdk error tracking (#849) - aeeb8f796
-  improved hot reload for running example and web portal locally (#855) - ec4301704

# Release (Thu Apr 17 2025)

## Package Versions
- @getpara/web-sdk@1.11.0
- @getpara/wagmi-v2-integration@1.11.0
- @getpara/wagmi-v1-integration@1.11.0
- @getpara/viem-v2-integration@1.11.0
- @getpara/viem-v1-integration@1.11.0
- @getpara/user-management-client@1.11.0
- @getpara/solana-web3.js-v1-integration@1.11.0
- @getpara/solana-wallet-connectors@1.11.0
- @getpara/server-sdk@1.11.0
- @getpara/react-sdk@1.11.0
- @getpara/react-native-wallet@1.11.0
- @getpara/react-components@1.11.0
- @getpara/react-common@1.11.0
- @getpara/evm-wallet-connectors@1.11.0
- @getpara/ethers-v6-integration@1.11.0
- @getpara/ethers-v5-integration@1.11.0
- @getpara/cosmos-wallet-connectors@1.11.0
- @getpara/cosmjs-v0-integration@1.11.0
- @getpara/core-sdk@1.11.0
- @getpara/core-components@1.11.0

### Features
-  Add `createGuestWallets` method and helpers (#851) - 6a28527d3
-  banner warning potential impact of slow wifi (#812) - b475c399b

### Fixes
-  add structuredClone shim (#856) - 187af96b0
-  Prevent unnecessary Apple passkey verification API calls (#848) - dcb87ac92
-  Truncate receive address display (#844) - e8248f5cb

### Chores
-  Basic readme updates (#766) - 034e76d88
-  Remove `qs` from sdk bundle (#857) - 410003e13
-  update test email domain from test.usecapsule.com to test.getpara.com (#685) - 4ac2d04c7
-  fix wagmi v2 version to latest (#850) - 5460779fa

### Tests
-  web portal unit tests (#840) - d40439016

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

