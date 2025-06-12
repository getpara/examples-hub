import { Button, FormField, FormItem, FormLabel, Input, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription } from '../../../../../components/formComponents';
import { VisibilityInput } from '../../../../../components/VisibilityInput';
import { SetupForm } from '../hooks/useSetupForm';
import { ConfigCard } from '../../../components/ConfigCard';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';
import { RotateApiKeyDialog } from './RotateApiKeyDialog';
import { RotateSecretApiKeyDialog } from './RotateSecretApiKeyDialog';
import { useSecretKeyStore } from '../hooks/useSecretKeyStore';

export const KeyData = () => {
  const secretKey = useSecretKeyStore(state => state.secretKey);
  const form = useFormContext<SetupForm>();
  const [isRotateApiKeyDialogOpen, setRotateApiKeyDialogOpen] = useState(false);
  const [isRotateSecretApiKeyDialogOpen, setRotateSecretApiKeyDialogOpen] = useState(false);

  const handleRotateApiKeyClick = () => {
    setRotateApiKeyDialogOpen(true);
  };

  const handleRotateSecretApiKeyClick = () => {
    setRotateSecretApiKeyDialogOpen(true);
  };

  return (
    <>
      <ConfigCard className="para:md:flex-col para:gap-8">
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="para:w-full para:flex-1">
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? undefined} className="para:disabled:opacity-100" />
                </FormControl>
                <FormDescription>Your project name will be shown to users</FormDescription>
              </FormItem>
            )}
          />
          <div className="para:flex para:flex-col para:gap-8 para:lg:flex-row">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <div className="para:w-full para:flex-1 para:flex para:flex-row para:gap-2">
                  <FormItem className="para:w-full para:flex-1">
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <VisibilityInput
                        {...field}
                        readOnly
                        inputClassName="para:disabled:opacity-100 para:text-ellipsis"
                        showCopyButton
                      />
                    </FormControl>
                    <FormDescription>
                      This API key is safe to expose client-side and does not expose any confidential information.
                    </FormDescription>
                  </FormItem>
                  <Button
                    className="para:px-4! para:mt-[22px] para:h-11"
                    value="icon"
                    variant="neutral"
                    onClick={handleRotateApiKeyClick}
                  >
                    <RotateCw />
                  </Button>
                </div>
              )}
            />
            <div className="para:w-full para:flex-1 para:flex para:flex-row para:gap-2">
              <FormItem className="">
                <FormLabel>Secret API Key</FormLabel>
                <FormControl>
                  {!secretKey ? (
                    <Input
                      value="***********************************"
                      readOnly
                      className="para:disabled:opacity-100 para:text-ellipsis"
                      type="password"
                    />
                  ) : (
                    <VisibilityInput
                      value={secretKey}
                      readOnly
                      inputClassName="para:disabled:opacity-100 para:text-ellipsis"
                      showCopyButton
                      defaultVisible
                    />
                  )}
                </FormControl>
                <FormDescription>
                  The Secret API Key is for use on your back-end services only. Be sure to keep it confidential.
                </FormDescription>
              </FormItem>
              <Button
                className="para:px-4! para:mt-[22px] para:h-11"
                value="icon"
                variant="neutral"
                onClick={handleRotateSecretApiKeyClick}
              >
                <RotateCw />
              </Button>
            </div>
          </div>
        </>
      </ConfigCard>
      <RotateApiKeyDialog isOpen={isRotateApiKeyDialogOpen} setIsOpen={setRotateApiKeyDialogOpen} />
      <RotateSecretApiKeyDialog isOpen={isRotateSecretApiKeyDialogOpen} setIsOpen={setRotateSecretApiKeyDialogOpen} />
    </>
  );
};
