import React from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, address }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Receive Funds</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:bg-secondary/10 transition-colors duration-200">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="aspect-square bg-white p-4 rounded-lg mb-4 flex items-center justify-center border border-border">
          <QRCodeSVG
            value={address}
            size={256}
            level="H"
            className="w-full h-full"
            fgColor="hsl(var(--secondary))"
            bgColor="white"
          />
        </div>

        <div className="relative group">
          <p
            className="text-sm text-center font-mono break-all text-muted-foreground bg-secondary/5 hover:bg-secondary/10 transition-colors duration-200 p-2 rounded cursor-pointer"
            onClick={() => navigator.clipboard.writeText(address)}
            title="Click to copy">
            {address}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
