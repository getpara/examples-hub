'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import WalletItem from '@/components/custom/wallet-item';

// Create a motion version of WalletItem using motion.create()
const MotionWalletItem = motion.create(WalletItem);

export default function AnimationTest() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
  }, []);

  return (
    <div className="para:flex para:flex-col para:items-center para:justify-center para:h-screen">
      <AnimatePresence mode="wait">
        {isActive ? (
          <MotionWalletItem
            key="standalone" // Add unique key
            id="wallet-1"
            logo="/mock-logos/acme-logo.png"
            name="An Extraordinarily Long Wallet Name"
            address="0x123...abc"
            balance="$3,283.00"
            layoutId="wallet-1"
            onCheckedChange={() => setIsActive(!isActive)}
            initial={{ opacity: 0, scale: 0.9 }} // Add initial for entrance
            animate={{ opacity: 1, scale: 1 }} // Add animate for entrance
            exit={{ opacity: 0, scale: 0.9 }} // Add exit for when it leaves
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            key="container" // Add unique key
            className="para:flex para:flex-col para:items-center para:justify-start para:border-1 para:border-border para:rounded-md para:p-4 para:shadow-md para:h-[500px]"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 500 }}
            exit={{ opacity: 0, height: 0 }} // This will now work
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <MotionWalletItem
              id="wallet-1"
              logo="/mock-logos/acme-logo.png"
              name="An Extraordinarily Long Wallet Name"
              address="0x123...abc"
              balance="$3,283.00"
              layoutId="wallet-1"
              onCheckedChange={() => setIsActive(!isActive)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
