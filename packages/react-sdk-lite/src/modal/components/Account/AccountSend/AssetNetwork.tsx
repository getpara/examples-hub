import { CpslIcon } from '@getpara/react-components';

export function AssetNetwork({
  size = 40,
  assetSrc,
  networkSrc,
}: {
  size?: number;
  assetSrc?: string;
  networkSrc?: string;
}) {
  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
      {assetSrc ? (
        <CpslIcon radius="full" src={assetSrc} size={`${size}px`} />
      ) : (
        <CpslIcon
          icon="coins"
          radius="full"
          size={`${size}px`}
          inset={`${size / 8}px`}
          color="var(--cpsl-color-text-contrast)"
          background="var(--cpsl-color-accent-64)"
        />
      )}
      {networkSrc && (
        <CpslIcon
          radius="full"
          src={networkSrc}
          size={`${2 + (size * 3) / 8}px`}
          border="1px solid var(--cpsl-color-background-4)"
          style={{ position: 'absolute', bottom: 0, right: 0 }}
        />
      )}
    </div>
  );
}
