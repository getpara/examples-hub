import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { Database, ExternalLink, Github, LogOut, Menu, Twitter } from "lucide-react";
import WebApp from "@twa-dev/sdk";
import { clearChunkedStorage } from "../../lib/cloudStorageUtil";
import para from "../../lib/para";

interface NavigationDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setScreen: (screen: ScreenName) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onOpenChange, setScreen }) => {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary/10 transition-colors duration-200">
          <Menu
            className="h-6 w-6 text-foreground"
            width={24}
            height={24}
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col border-l border-border bg-background">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-foreground">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1">
          <div className="space-y-4 py-6">
            <Button
              className="w-full justify-start transition-colors duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
              asChild>
              <a
                href="https://getpara.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>

            <Button
              className="w-full justify-start transition-colors duration-200 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              asChild>
              <a
                href="https://docs.getpara.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </Button>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="bg-muted text-muted-foreground hover:bg-muted/90 transition-colors duration-200"
                asChild>
                <a
                  href="https://x.com/getpara"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="bg-muted text-muted-foreground hover:bg-muted/90 transition-colors duration-200"
                asChild>
                <a
                  href="https://github.com/getpara/examples-hub"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-4">
            <div className="space-y-3">
              <Button
                onClick={async () => {
                  await clearChunkedStorage(
                    () => {},
                    () => {}
                  );
                  para.clearStorage("all");
                  para.logout();
                  setScreen("onboarding");
                }}
                className="w-full justify-start transition-colors duration-200 bg-accent text-accent-foreground hover:bg-accent/90">
                <Database className="mr-2 h-4 w-4" />
                Clear Storage
              </Button>

              <Button
                onClick={() => {
                  WebApp.close();
                }}
                className="w-full justify-start transition-colors duration-200 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <LogOut className="mr-2 h-4 w-4" />
                Close App
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationDrawer;
