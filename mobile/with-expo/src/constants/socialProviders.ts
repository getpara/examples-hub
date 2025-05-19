import { SocialLoginProvidersMap } from "@/types";
import { OAuthMethod } from "@getpara/react-native-wallet";

export const PROVIDER_INFO: SocialLoginProvidersMap = {
  [OAuthMethod.GOOGLE]: { name: "Google", logo: require("../assets/google-logo.png") },
  [OAuthMethod.TWITTER]: { name: "Twitter", logo: require("../assets/twitter-logo.png") },
  [OAuthMethod.APPLE]: { name: "Apple", logo: require("../assets/apple-logo.png") },
  [OAuthMethod.DISCORD]: { name: "Discord", logo: require("../assets/discord-logo.png") },
  [OAuthMethod.FACEBOOK]: { name: "Facebook", logo: require("../assets/facebook-logo.png") },
  [OAuthMethod.TELEGRAM]: { name: "Telegram", logo: require("../assets/telegram-logo.png") },
};

export const INITIAL_PROVIDERS: OAuthMethod[] = [OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.APPLE];
export const ADDITIONAL_PROVIDERS: OAuthMethod[] = [OAuthMethod.TWITTER, OAuthMethod.DISCORD, OAuthMethod.TELEGRAM];
export const MAX_PROVIDERS_PER_ROW = 3;
