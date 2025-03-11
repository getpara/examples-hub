import paraModule, { Environment, OAuthMethod } from "@web3-onboard/capsule";
import { CapsuleInitOptions } from "@web3-onboard/capsule/dist/types";
import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY || "";

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const initOptions: CapsuleInitOptions = {
  environment: Environment.BETA,
  apiKey: API_KEY,
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
    appName: "Para Web3-Onboard Example",
    logo: "/para.svg",
    recoverySecretStepEnabled: true,
    disableEmailLogin: false,
    disablePhoneLogin: false,
  },
  walletLabel: "Sign in with Para",
};

const para = paraModule(initOptions);

const injected = injectedModule();

const wallets = [para, injected];

const chains = [
  {
    id: 11155111,
    token: "ETH",
    label: "Sepolia",
    rpcUrl: "https://rpc.sepolia.org/",
  },
];
const appMetadata = {
  name: "Para Example App",
  description: "Example app for Para Web3-Onboard Authentication",
};

init({
  wallets,
  chains,
  appMetadata,
});
