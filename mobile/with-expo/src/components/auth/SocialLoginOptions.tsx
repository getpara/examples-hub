import React, { useMemo, useState } from "react";
import { View, Image, Pressable } from "react-native";
import { Grip, X } from "@/components/icons";
import { OAuthMethod } from "@getpara/react-native-wallet";
import { PROVIDER_INFO, INITIAL_PROVIDERS, ADDITIONAL_PROVIDERS, MAX_PROVIDERS_PER_ROW } from "@/lib/constants";

interface SocialLoginOptionsProps {
  onSelect(provider: OAuthMethod): void;
  disabled?: boolean;
}

export function SocialLoginOptions({ onSelect, disabled }: SocialLoginOptionsProps) {
  const [expanded, setExpanded] = useState(false);

  const providers = expanded ? [...INITIAL_PROVIDERS, ...ADDITIONAL_PROVIDERS] : INITIAL_PROVIDERS;

  const providerRows = useMemo(() => {
    const rows: OAuthMethod[][] = [];
    for (let i = 0; i < providers.length; i += MAX_PROVIDERS_PER_ROW) {
      rows.push(providers.slice(i, i + MAX_PROVIDERS_PER_ROW));
    }
    return rows;
  }, [providers]);

  const renderProvider = (provider: OAuthMethod) => {
    if (provider === OAuthMethod.FARCASTER) return null;
    return (
      <Pressable
        key={provider}
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${PROVIDER_INFO[provider].name}`}
        onPress={() => onSelect(provider)}
        className="flex-1 h-14 items-center justify-center rounded-xl
                   border border-border bg-white
                   active:opacity-80">
        <Image
          source={PROVIDER_INFO[provider].logo}
          resizeMode="contain"
          className="h-8 w-8"
        />
      </Pressable>
    );
  };

  const renderToggle = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={expanded ? "Show fewer options" : "Show more options"}
      onPress={() => setExpanded((v) => !v)}
      className="flex-1 h-14 items-center justify-center rounded-xl
                 border border-border bg-white
                 active:opacity-80">
      {expanded ? (
        <X
          size={24}
          className="text-muted-foreground"
        />
      ) : (
        <Grip
          size={24}
          className="text-muted-foreground"
        />
      )}
    </Pressable>
  );

  return (
    <View>
      <View className="gap-y-2">
        {providerRows.map((row, idx) => (
          <View
            key={idx}
            className="flex-row gap-x-2">
            {row.map(renderProvider)}
            {idx === providerRows.length - 1 && renderToggle()}
          </View>
        ))}
      </View>
    </View>
  );
}
