'use client';

import { motion } from 'motion/react';
import WalletItem from '@/components/custom/wallet-item';
import { cn } from '@/lib/utils';

export interface WalletItemData {
  id: string;
  name?: string;
  address?: string;
  balance?: string;
  logo: string;
  variant?: 'wallet' | 'create';
}

interface WalletGroupProps {
  title: string;
  iconSrc: string;
  iconAlt: string;
  iconClassName?: string;
  wallets: WalletItemData[];
  selectedWallets: string[];
  onWalletToggle: (walletId: string, checked: boolean) => void;
  staggerDelay?: number;
  shouldAnimate?: boolean; // Control when to start animating
  onAnimationComplete?: () => void; // Callback when all wallets finish
}

export default function WalletGroup({
  title,
  iconSrc,
  iconAlt,
  iconClassName,
  wallets,
  selectedWallets,
  onWalletToggle,
  staggerDelay = 0.04,
}: WalletGroupProps) {
  // Default base classes
  const defaultIconClasses =
    'para:rounded-full para:p-1 para:bg-black para:w-5 para:h-5 para:flex para:items-center para:justify-center para:border-1 para:border-foreground/20';

  // Merge custom classes with defaults, allowing overrides
  const finalIconClassName = iconClassName ? cn(defaultIconClasses, iconClassName) : defaultIconClasses;

  return (
    <motion.div
      className="wallet-type-group para:flex para:flex-col para:items-start para:justify-center para:gap-4 para:w-full"
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            staggerChildren: staggerDelay, // Stagger between title and wallets
          },
        },
      }}
      // Remove initial and animate - let parent control via variants
    >
      {/* Wallet Selection Title */}
      <motion.div
        className="para:flex para:flex-row para:items-center para:justify-start para:w-full para:gap-1"
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={finalIconClassName}>
          <img src={iconSrc} alt={iconAlt} className="para:w-full para:h-full" />
        </div>
        <h3 className="para:text-md para:font-medium">
          {title} {selectedWallets.length ? `(${selectedWallets.length})` : ''}{' '}
        </h3>
      </motion.div>

      {/* Wallets */}
      <motion.div
        className="para:flex para:flex-col para:gap-5 para:w-full"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        }}
      >
        {wallets.map(wallet => (
          <motion.div
            key={wallet.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <WalletItem
              id={wallet.id}
              name={wallet.name}
              address={wallet.address}
              balance={wallet.balance}
              logo={wallet.logo}
              variant={wallet.variant}
              checked={selectedWallets.includes(wallet.id)}
              onCheckedChange={checked => onWalletToggle(wallet.id, checked)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
