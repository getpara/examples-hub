import React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletDetails: any;
}

const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({ isOpen, onClose, walletDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-2xl w-full border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Wallet Details</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:bg-secondary/10 transition-colors duration-200">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <pre className="bg-secondary/5 p-4 rounded-lg font-mono text-sm text-foreground overflow-x-auto">
            {JSON.stringify(walletDetails, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default WalletDetailsModal;
