'use client';

import AuthModal from '@/components/auth-modal';
import Sidebar from '@/components/sidebar';

export default function Home() {
  return (
    <div>
      <div className="para:flex para:flex-row">
        <Sidebar />
        <div className="para:flex para:flex-col para:items-center para:justify-center para:h-screen para:w-full">
          <AuthModal />
        </div>
      </div>
    </div>
  );
}
