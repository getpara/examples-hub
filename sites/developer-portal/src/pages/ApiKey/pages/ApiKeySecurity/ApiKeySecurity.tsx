import { ContentWrapper } from '../../components/ContentWrapper';
import { useSecurityForm } from './hooks/useSecurityForm';
/* TODO(REST API): Re-enable once Allowed IP management ships. */
// import { AllowedIpAddresses } from './components/AllowedIpAddresses';
import { Origins } from './components/Origins';
import { AuthMethods } from './components/AuthMethods';
import { TransactionPopups } from './components/TransactionPopups';
import { SessionLength } from './components/SessionLength';
import { FormWrapper } from '../../components/FormWrapper';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Typography,
} from '@getpara/react-component-library';
import { AUTH_METHODS_DOCS_LINK } from '../../../../utils/constants';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const ApiKeySecurity = () => {
  const [confirmationModal, setConfirmationModal] = useState<{ onConfirm: () => void; onCancel: () => void } | null>(null);
  const { form, submitForm } = useSecurityForm({ showConfirmationModal: setConfirmationModal });

  const handleOpenChange = (open: boolean) => {
    if (!open && confirmationModal) {
      confirmationModal.onCancel();
      setConfirmationModal(null);
    }
  };

  const handleConfirm = () => {
    if (confirmationModal) {
      confirmationModal.onConfirm();
      setConfirmationModal(null);
    }
  };

  return (
    <>
      <FormWrapper {...form} submitForm={submitForm}>
        <ContentWrapper
          columnOne={
            <>
              {/* TODO(REST API): Re-enable once Allowed IP management ships.
            <AllowedIpAddresses />
            */}
              <Origins />
              <AuthMethods />
              <TransactionPopups />
              {/* TODO: add 2fa control once 2fa is configured on the key */}
              {/* <TwoFactorAuth /> */}
              <SessionLength />
            </>
          }
        />
      </FormWrapper>
      <Dialog open={!!confirmationModal} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="para:text-left">Confirm Security Settings</DialogTitle>
            <DialogDescription>
              <Typography className="para:text-left para:text-sm" color="muted">
                Turning off all additional security features requires: <br />
                <br />
                <Typography className="para:font-semibold">SDK version Alpha 2.0 v68 or higher</Typography>
                <br />
                Please be sure you are on this version before proceeding with these settings.
              </Typography>
            </DialogDescription>
          </DialogHeader>
          <Link to={AUTH_METHODS_DOCS_LINK} target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary" className="para:w-full">
              Learn more about Security Settings
              <ExternalLink />
            </Button>
          </Link>
          <DialogFooter>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
