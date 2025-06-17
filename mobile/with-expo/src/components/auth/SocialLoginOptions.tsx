import React, { useState } from 'react';
import { View, Image, Pressable } from 'react-native';
import { Grip, X } from '@/components/icons';
import { SocialLoginProvidersMap } from '@/types';
import { generateProviderRows } from '@/utils/socialLoginUtils';
import { OAuthMethod } from '@getpara/react-native-wallet';

interface SocialLoginOptionsProps {
  initialProviders: OAuthMethod[];
  additionalProviders: OAuthMethod[];
  providerInfo: SocialLoginProvidersMap;
  maxProvidersPerRow: number;
  onSelect(provider: OAuthMethod): void;
  disabled?: boolean;
  excludeProviders?: OAuthMethod[];
}

export function SocialLoginOptions({
  initialProviders,
  additionalProviders,
  providerInfo,
  maxProvidersPerRow,
  onSelect,
  disabled,
  excludeProviders = [],
}: SocialLoginOptionsProps) {
  const [expanded, setExpanded] = useState(false);

  const providers = expanded
    ? [...initialProviders, ...additionalProviders]
    : initialProviders;

  const filteredProviders = providers.filter(
    (provider) => !excludeProviders.includes(provider)
  );

  const providerRows = generateProviderRows(
    filteredProviders,
    maxProvidersPerRow
  );

  const renderProvider = (provider: OAuthMethod) => {
    const info = providerInfo[provider];
    if (!info) return null;

    return (
      <Pressable
        key={provider}
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${info.name}`}
        onPress={() => onSelect(provider)}
        disabled={disabled}
        className="flex-1 h-14 items-center justify-center rounded-xl
                   border border-border bg-white
                   active:opacity-80"
      >
        <Image source={info.logo} resizeMode="contain" className="h-8 w-8" />
      </Pressable>
    );
  };

  const renderToggle = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={expanded ? 'Show fewer options' : 'Show more options'}
      onPress={() => setExpanded((v) => !v)}
      className="flex-1 h-14 items-center justify-center rounded-xl
                 border border-border bg-white
                 active:opacity-80"
    >
      {expanded ? (
        <X size={24} className="text-muted-foreground" />
      ) : (
        <Grip size={24} className="text-muted-foreground" />
      )}
    </Pressable>
  );

  return (
    <View>
      <View className="gap-y-2">
        {providerRows.map((row, idx) => (
          <View key={idx} className="flex-row gap-x-2">
            {row.map(renderProvider)}
            {idx === providerRows.length - 1 && renderToggle()}
          </View>
        ))}
      </View>
    </View>
  );
}
