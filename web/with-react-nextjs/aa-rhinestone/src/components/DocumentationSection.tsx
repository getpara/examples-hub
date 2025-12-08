"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DocumentationSection() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Implementation Guide */}
      <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            Step-by-step guide to implement what you just experienced
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">
                1. Install the SDK
              </h4>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm font-mono">
                npm install @rhinestone/sdk
              </div>

              <h4 className="font-semibold text-slate-900">
                2. Create a Global Wallet
              </h4>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm font-mono">
                {`const rhinestone = new RhinestoneSDK({
  apiKey: "your-api-key",
});
const account = await rhinestone.createAccount({
  owners: { type: "ecdsa", accounts: [owner] },
})`}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">
                3. Execute Cross-Chain Transfer
              </h4>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm font-mono">
                {`await account.sendTransaction({
  sourceChains: [arbitrum],
  targetChain: base,
  calls: [transferCall],
  tokenRequests: [usdcRequest]
})`}
              </div>

              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <a
                    href="https://docs.rhinestone.dev/quick-start"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Full Tutorial
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href="https://github.com/rhinestonewtf/global-wallet-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Source
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
