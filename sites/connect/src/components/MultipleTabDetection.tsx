import { useEffect } from 'react';
import { TabDetectionManager } from '../utils/tabDetectionManager';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Typography,
} from '@getpara/react-component-library';

export const MultipleTabDetection = () => {
  const [hasMultipleTabs, setHasMultipleTabs] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Initialize tab detection - simplified
  useEffect(() => {
    const manager = new TabDetectionManager();

    manager.onMultipleTabs(multipleTabs => {
      setHasMultipleTabs(multipleTabs);
    });

    return () => {
      manager.cleanup();
    };
  }, []);

  return (
    <Dialog open={hasMultipleTabs && !hasAcknowledged}>
      <DialogContent noClose>
        <DialogHeader>
          <DialogTitle>Multiple Apps Open</DialogTitle>
          <DialogDescription>Multiple Para Connect apps are detected.</DialogDescription>
        </DialogHeader>
        <Typography>
          Having multiple Para Connect apps open can cause issues with transaction, we recommend closing any additional Para
          Connect apps.
        </Typography>
        <DialogFooter>
          <DialogClose onClick={() => setHasAcknowledged(true)} asChild>
            <Button variant="neutral" size="lg">
              Continue
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
