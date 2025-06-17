import { FormField, FormItem, FormLabel, Input, IOS, Typography, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { SetupForm } from '../hooks/useSetupForm';
import { VerificationStatus } from './VerificationStatus';
import bundleIdentifierImg from '../assets/bundle-identifier.png';
import teamIDImg from '../assets/team-id.png';
import { useParams } from 'react-router-dom';
import { Environment } from '../../../../../types/environment';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { useGetOrganizationHasNativePasskeyAccess } from '../../../../../hooks/api/queries/useOrganizationSubscription';

export const AppleSetup = () => {
  const { data: hasNativePasskeyAccess } = useGetOrganizationHasNativePasskeyAccess();
  const form = useFormContext<SetupForm>();
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const hideAccess = env?.toUpperCase() === Environment.PROD && !hasNativePasskeyAccess;

  if (hideAccess) {
    return null;
  }

  const { teamId, bundleIdentifier } = apiKeyData ?? {};

  // Only show status if we have saved values
  const isConfigured = !!teamId && !!bundleIdentifier;

  return (
    <>
      <div className="para:flex para:items-center para:gap-2">
        <IOS />
        <Typography className="para:text-xl para:font-medium para:leading-none">iOS</Typography>
      </div>
      <div>
        <Typography className="para:font-semibold">Get Team ID and Bundle Identifier</Typography>
        <Typography className="para:text-sm" color="secondary">
          You will need these identifiers to build your app.
        </Typography>
      </div>
      <VerificationStatus platform="apple" isConfigured={isConfigured} />
      <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
        <div className="para:flex-1 para:flex-col para:gap-2">
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem className="para:w-full para:flex-1">
                <FormLabel>Team ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="abcde12345" value={field.value ?? undefined} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <img src={teamIDImg} alt="Team ID" className="para:w-full" />
          <Typography className="para:text-sm para:mt-2 para:break-all" color="secondary">
            You can find your Team ID at developer.app.com/account/resources/list.
          </Typography>
        </div>
        <div className="para:flex-1 para:flex-col para:gap-2">
          <FormField
            control={form.control}
            name="bundleIdentifier"
            render={({ field }) => (
              <FormItem className="para:w-full para:flex-1">
                <FormLabel>Bundle Identifier</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="com.yourdomain.yourapp" value={field.value ?? undefined} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <img src={bundleIdentifierImg} alt="Bundle Identifier" className="para:w-full" />
          <Typography className="para:text-sm para:mt-2" color="secondary">
            You can find your Bundle Identifier in the “Signing & Capabilities” section of your Xcode project.
          </Typography>
        </div>
      </div>
    </>
  );
};
