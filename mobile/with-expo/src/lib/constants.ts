import { OAuthProviderInfo } from "@/types";
import { OAuthMethod } from "@getpara/react-native-wallet";

export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const PROVIDER_INFO: Record<Exclude<OAuthMethod, OAuthMethod.FARCASTER>, OAuthProviderInfo> = {
  [OAuthMethod.GOOGLE]: { name: "Google", logo: require("../assets/google-logo.png") },
  [OAuthMethod.TWITTER]: { name: "Twitter", logo: require("../assets/twitter-logo.png") },
  [OAuthMethod.APPLE]: { name: "Apple", logo: require("../assets/apple-logo.png") },
  [OAuthMethod.DISCORD]: { name: "Discord", logo: require("../assets/discord-logo.png") },
  [OAuthMethod.FACEBOOK]: { name: "Facebook", logo: require("../assets/facebook-logo.png") },
  [OAuthMethod.TELEGRAM]: { name: "Telegram", logo: require("../assets/telegram-logo.png") },
};

export const INITIAL_PROVIDERS = [OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.APPLE];
export const ADDITIONAL_PROVIDERS = [OAuthMethod.TWITTER, OAuthMethod.DISCORD, OAuthMethod.TELEGRAM];
export const MAX_PROVIDERS_PER_ROW = 3;
