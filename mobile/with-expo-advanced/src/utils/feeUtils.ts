export type FeeTier = 'slow' | 'average' | 'fast';
export type PriorityLevel = 'none' | 'low' | 'medium' | 'high';

export interface PriorityFeeOption {
  level: PriorityLevel;
  value: number;
  label: string;
  description: string;
}

// Priority fee configuration
export const PRIORITY_FEE_OPTIONS: PriorityFeeOption[] = [
  {
    level: 'none',
    value: 0,
    label: 'Standard',
    description: 'No priority fee',
  },
  {
    level: 'low',
    value: 10000,
    label: 'Low Priority',
    description: 'Slightly faster processing',
  },
  {
    level: 'medium',
    value: 50000,
    label: 'Medium Priority',
    description: 'Faster processing',
  },
  {
    level: 'high',
    value: 100000,
    label: 'High Priority',
    description: 'Fastest processing',
  },
];

// Fee tier styling configuration
export function getFeeTierStyles(tier: FeeTier) {
  switch (tier) {
    case 'slow':
      return {
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        icon: 'Clock' as const,
      };
    case 'average':
      return {
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        icon: 'Coins' as const,
      };
    case 'fast':
      return {
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        icon: 'Zap' as const,
      };
  }
}

// Solana fee calculations
export function calculateTotalSolanaFee(
  baseFee: number,
  priorityFeeLevel: PriorityLevel
): string {
  const priorityFeeOption = PRIORITY_FEE_OPTIONS.find(
    (o) => o.level === priorityFeeLevel
  );
  const priorityFee = priorityFeeOption ? priorityFeeOption.value : 0;
  const totalLamports = baseFee + priorityFee;
  return (totalLamports / 1_000_000_000).toFixed(9);
}

export function calculateTotalSolanaFeeUsd(
  baseFeeUsd: number | null,
  priorityFeeLevel: PriorityLevel,
  solPriceUsd: number | null
): number | null {
  if (baseFeeUsd === null || solPriceUsd === null) return null;

  const priorityFeeOption = PRIORITY_FEE_OPTIONS.find(
    (o) => o.level === priorityFeeLevel
  );
  const priorityFee = priorityFeeOption ? priorityFeeOption.value : 0;
  const priorityFeeInSol = priorityFee / 1_000_000_000;
  const priorityFeeUsd = priorityFeeInSol * solPriceUsd;

  return baseFeeUsd + priorityFeeUsd;
}

// Get priority fee value
export function getPriorityFeeValue(level: PriorityLevel): number {
  const option = PRIORITY_FEE_OPTIONS.find((o) => o.level === level);
  return option ? option.value : 0;
}

// Format priority fee for display
export function formatPriorityFee(value: number): string {
  return `+${(value / 1_000_000_000).toFixed(6)} SOL`;
}
