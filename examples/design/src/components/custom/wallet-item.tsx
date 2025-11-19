'use client';

import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { forwardRef } from 'react';

interface WalletItemProps {
  id: string;
  name?: string;
  address?: string; // Make optional
  balance?: string; // Make optional
  logo: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: 'wallet' | 'create'; // Add variant prop
  layoutId?: string; // Add this
}

const WalletItem = forwardRef<HTMLDivElement, WalletItemProps>(
  (
    {
      name,
      address,
      balance,
      logo,
      checked,
      variant,
      onCheckedChange,
      layoutId, // Add this
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref} // Forward the ref - REQUIRED for motion.create() to work
        layoutId={layoutId} // Pass layoutId to motion.div
        onClick={() => onCheckedChange?.(!checked)}
        className="para:relative para:flex para:flex-row para:items-center para:justify-between para:w-full para:gap-2 para:cursor-pointer para:group para:max-w-sm"
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.04, ease: 'easeOut' }}
      >
        {/* Wallet Item Content */}
        <div className="para:relative para:z-1 para:flex para:flex-row para:items-center para:justify-between para:w-full para:min-w-0">
          {/* Wallet Item Name and Address */}
          <div className="para:flex para:flex-row para:items-center para:justify-start para:gap-2 para:pointer-events-auto para:min-w-0 para:flex-1">
            {/* Wallet Item Logo */}
            <div className="box-sizing-border para:rounded-md para:border-1 para:border-foreground/5 para:relative para:overflow-clip para:flex-shrink-0">
              {variant === 'create' ? (
                <div className="para:w-10 para:h-10 para:flex para:items-center para:justify-center para:flex-shrink-0">
                  <Plus size={20} className="para:text-muted-foreground" />
                </div>
              ) : (
                <img src={logo} alt={`${name} Logo`} className="para:w-10 para:h-10 para:flex-shrink-0" />
              )}
            </div>
            {/* Wallet Item Name and Address - Add min-w-0 here */}
            <div className="para:min-w-0 para:flex-1">
              <h2 className="para:text-xl para:font-semibold para:truncate">
                {variant === 'create' ? 'Create Wallet' : name}
              </h2>
              {variant !== 'create' && (
                <p className="para:text-sm para:font-medium para:text-muted-foreground para:truncate">{address}</p>
              )}
            </div>
          </div>
          {/* Wallet Item Balance - Add flex-shrink-0 to prevent being squeezed */}
          {variant !== 'create' && (
            <div className="para:flex para:flex-row para:items-center para:justify-end para:gap-2 para:pointer-events-auto para:flex-shrink-0 para:ml-2">
              <h2 className="para:text-md para:font-medium para:whitespace-nowrap">{balance}</h2>
            </div>
          )}
        </div>
        {/* Wallet Item Background Hover Effect */}
        <div
          className={`para:absolute para:inset-0 para:-inset-x-2 para:-inset-y-2 para:rounded-md para:transition-all para:duration-200 para:group-hover:bg-muted ${
            checked ? 'para:bg-muted para:border para:border-border' : ''
          }`}
        />
      </motion.div>
    );
  },
);

WalletItem.displayName = 'WalletItem';

export default WalletItem;
