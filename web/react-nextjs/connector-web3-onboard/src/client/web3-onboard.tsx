import capsuleModule, { Environment, OAuthMethod } from "@web3-onboard/capsule";
import { CapsuleInitOptions } from "@web3-onboard/capsule/dist/types";
import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const CAPSULE_API_KEY = process.env.NEXT_PUBLIC_CAPSULE_API_KEY || "";

const initOptions: CapsuleInitOptions = {
  environment: Environment.BETA,
  apiKey: CAPSULE_API_KEY,
  modalProps: {
    authLayout: ["AUTH:FULL"],
    oAuthMethods: [
      OAuthMethod.APPLE,
      OAuthMethod.DISCORD,
      OAuthMethod.FACEBOOK,
      OAuthMethod.FARCASTER,
      OAuthMethod.GOOGLE,
      OAuthMethod.TWITTER,
    ],
    appName: "Capsule Web3-Onboard Example",
    logo: "/capsule.svg",
    recoverySecretStepEnabled: true,
    disableEmailLogin: false,
    disablePhoneLogin: false,
  },
  walletLabel: "Sign in with Capsule",
};

const capsule = capsuleModule(initOptions);

const injected = injectedModule();

const wallets = [capsule, injected];

const chains = [
  {
    id: 11155111,
    token: "ETH",
    label: "Sepolia",
    rpcUrl: "https://rpc.sepolia.org/",
  },
];
const appMetadata = {
  name: "Capsule Example App",
  description: "Example app for Capsule Web3-Onboard Authentication",
};

init({
  wallets,
  chains,
  appMetadata,
});
