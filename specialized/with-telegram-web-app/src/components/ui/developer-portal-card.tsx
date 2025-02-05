import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { ExternalLink } from "lucide-react";

interface DeveloperPortalCardProps {
  onPortalClick?: () => void;
}

export const DeveloperPortalCard: React.FC<DeveloperPortalCardProps> = ({ onPortalClick }) => {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Developer Portal</CardTitle>
        <CardDescription className="text-muted-foreground">
          Start building with our comprehensive tools and documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-200"
          onClick={onPortalClick}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit Portal
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeveloperPortalCard;
