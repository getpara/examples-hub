'use client';

import { Button } from '@/components/ui/button';

export default function Portal() {
  const handleOpenPopup = () => {
    const width = 500;
    const height = 800;

    const topOffset = 100;

    const left = (window.screen.width - width) / 2;
    const top = topOffset;

    const features = `width=${width},height=${height},left=${left},top=${top}`;
    window.open(
      '/wallet-selection', // URL to open
      'popup', // Window name
      features, // Window features
    );
  };

  return (
    <div className="para:flex para:flex-col para:items-center para:justify-center para:h-screen">
      <Button onClick={handleOpenPopup}>Click me</Button>
    </div>
  );
}
