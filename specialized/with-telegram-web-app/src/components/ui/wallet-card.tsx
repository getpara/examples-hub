import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { QrCode, Send, User } from "lucide-react";

interface WalletCardProps {
  username: string;
  profileImage: string;
  walletAddress: string;
  portfolioValue: string;
  onReceiveClick: () => void;
  onSendClick: () => void;
  onWalletDetailsClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  username,
  profileImage,
  walletAddress,
  portfolioValue,
  onReceiveClick,
  onSendClick,
  onWalletDetailsClick,
}) => {
  return (
    <Card className="bg-background border-border">
      <CardContent className="pt-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary/20 overflow-hidden flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-medium text-lg text-foreground">
              {username || "Anon" + Math.floor(Math.random() * 1000)}
            </h2>
            <p
              className="text-muted-foreground text-sm font-medium cursor-pointer hover:text-foreground transition-colors duration-200"
              onClick={onWalletDetailsClick}>
              {`${walletAddress.slice(0, 12)}...${walletAddress.slice(-6)}`}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground text-sm font-medium tracking-wide mb-1">PORTFOLIO</p>
          <div className="flex items-baseline justify-between">
            <h1 className="text-4xl font-medium text-foreground">{`Ξ${portfolioValue}`}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-200 h-12"
            onClick={onReceiveClick}>
            <QrCode className="w-4 h-4 mr-2" />
            Receive
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 h-12"
            onClick={onSendClick}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
