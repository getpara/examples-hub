import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface BridgeFormProps {
  children: ReactNode;
  isConnected: boolean;
  isValid: boolean;
  onConnect: () => void;
  onBridge: () => void;
}

export function BridgeForm({ children, isConnected, isValid, onConnect, onBridge }: BridgeFormProps) {
  return (
    <div className="container max-w-xl">
      <Card className="w-full shadow-xl rounded-2xl overflow-hidden border border-border bg-white">
        <CardHeader className="pb-4 pt-8 px-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Squid Demo Bridge</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6">{children}</CardContent>

        <CardFooter className="pb-6 pt-2 px-6">
          <Button
            className="w-full h-14 text-base font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all duration-200"
            onClick={isConnected ? onBridge : onConnect}
            disabled={isConnected && !isValid}>
            {isConnected ? "Bridge Assets" : "Connect Wallet"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
