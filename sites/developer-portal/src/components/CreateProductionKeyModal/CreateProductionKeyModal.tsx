import { triggerToast } from '../../utils/toasts';
import { IS_BETA, IS_PROD } from '../../utils/constants';
import { HTTPS_URL_REGEX } from '../../utils/regex';
import { useCreateApiKey } from '../../hooks/api/mutations/useCreateApiKey';
import { Environment } from '../../types/environment';
import { AxiosError } from 'axios';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@getpara/react-component-library';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAvailableKeyEnvs, useGetOrganizationKey } from '../../hooks/api/queries/useOrganizationKeys';
import { useGetOrganizationSubscriptionPlan } from '../../hooks/api/queries/useOrganizationSubscription';
import { useGetSelectedOrganizationIsValid } from '../../hooks/api/queries/useOrganizations';
import { formatEnvName } from '../../utils/apiKey';
import { SubmitHandler, useForm } from 'react-hook-form';

interface CreateProductionKeyModalProps {
  open: boolean;
  setIsOpen: (_: boolean) => void;
}

const DEFAULT_VALUES = {
  homepageUrl: '',
};

export const CreateProductionKeyModal = ({ open, setIsOpen }: CreateProductionKeyModalProps) => {
  const { projectId, organizationId, apiKey, env } = useParams();
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const { mutate: createApiKey, isPending: isCreatingKey } = useCreateApiKey();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: orgValid } = useGetSelectedOrganizationIsValid();
  const navigate = useNavigate();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  const availableKeyEnv = availableKeyEnvs?.find(
    env => env === (IS_PROD ? Environment.PROD : IS_BETA ? Environment.BETA : Environment.SANDBOX),
  );

  const onSubmit: SubmitHandler<{
    homepageUrl: string;
  }> = ({ homepageUrl }) => {
    if (orgValid && !!availableKeyEnv && projectId) {
      createApiKey(
        {
          projectId,
          env: IS_PROD ? Environment.PROD : Environment.BETA,
          // Using default values here so we don't copy unsaved changes
          data: { ...apiKeyData, homepageUrl },
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            triggerToast({
              variant: 'success',
              title: 'Key Created!',
            });
          },
          onError: err => {
            let body = 'Please try again. If the problem persists, contact Para support.';

            if ((err as AxiosError).response?.data === 'max keys created for the current project') {
              body = `You've reached the max number of ${formatEnvName(availableKeyEnv)} API keys allowed on this project. Archive another key or create another project to add more API keys.`;
            }

            triggerToast({
              variant: 'error',
              title: 'Failed to Create Key',
              body,
            });
          },
        },
      );
    }
  };

  const handleUpgradeClick = () => {
    navigate(`/${organizationId}/billing`);
  };

  if (!availableKeyEnv) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) {
          form.reset(DEFAULT_VALUES);
        }

        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="para:text-left para:text-foreground">{`Create ${formatEnvName(availableKeyEnv)} Key`}</DialogTitle>
          <DialogDescription className="para:text-left">{`This will create a ${formatEnvName(availableKeyEnv)} API key with all the settings of the current ${IS_PROD ? 'Beta' : 'Sandbox'} API Key.`}</DialogDescription>
        </DialogHeader>
        {plan?.canCreateProdKeys ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="para:flex para:flex-col para:gap-4">
              <div className="para:flex para:flex-col para:gap-2">
                <FormField
                  control={form.control}
                  name="homepageUrl"
                  rules={{
                    required: 'Website URL is required',
                    pattern: {
                      value: HTTPS_URL_REGEX,
                      message: 'Must be a secure (https) url',
                    },
                  }}
                  render={({ field: { ref: _, ...restField } }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl className="para:mt-2 para:mb-1">
                        <Input placeholder="https://www.yourwebsite.com" {...restField} />
                      </FormControl>
                      <FormMessage className="para:text-xs para:text-destructive" />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreatingKey}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            <Alert>{`${IS_PROD ? 'Production' : 'Beta'} API Keys are only available on paid plans. Please upgrade.`}</Alert>
            <Button className="para:w-full" onClick={handleUpgradeClick}>
              Upgrade
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
