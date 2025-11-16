"use client";

import { WalletSidebar } from "@/components/WalletSidebar";
import { MainContent } from "@/components/MainContent";

export default function App() {
  return (
    <div className="h-screen bg-white flex">
      {/* Left Sidebar - Title */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900">
            Global Wallet Demo
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            One address, all chains. Cross-chain transfers made simple.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              How it works
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <p>Connect wallet to create global address</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <p>Deposit tokens on any supported chain</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <p>Spend from any chain to any chain</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Powered by Rhinestone
            </h3>
            <div className="text-xs text-slate-600 space-y-2">
              <p>• Smart account infrastructure</p>
              <p>• Cross-chain intent execution</p>
              <p>• No manual bridging required</p>
              <p>• Production-ready SDK</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Supported Chains
            </h3>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                Ethereum
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                Arbitrum
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                Base
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                Polygon
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                Optimism
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-1">
          <MainContent />

          {/* Right Sidebar - Wallet */}
          <div className="w-80 bg-slate-50 border-l border-slate-200">
            <WalletSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
