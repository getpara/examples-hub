import {
  Android,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Textarea,
  Typography,
  useFormContext,
} from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { SetupForm } from '../hooks/useSetupForm';
import { VerificationStatus } from './VerificationStatus';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { useParams } from 'react-router-dom';
import { CopyTextarea } from '../../../../../components/CopyTextarea';

export const AndroidSetup = () => {
  const form = useFormContext<SetupForm>();
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const { androidPackageName, androidSha256CertFingerprints } = apiKeyData ?? {};

  // Only show status if we have saved values
  const isConfigured = !!androidPackageName && !!androidSha256CertFingerprints;

  return (
    <>
      <div className="para:flex para:items-center para:gap-2">
        <Android />
        <Typography className="para:text-xl para:font-medium para:leading-none">Android</Typography>
      </div>
      <div>
        <Typography className="para:font-semibold">Get Package Name and SHA256 Fingerprint</Typography>
        <Typography className="para:text-sm" color="secondary">
          You will need these identifiers to build your app.
        </Typography>
      </div>
      <VerificationStatus platform="android" isConfigured={isConfigured} />
      <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
        <div className="para:flex-1 para:flex-col para:gap-2">
          <FormField
            control={form.control}
            name="androidPackageName"
            render={({ field }) => (
              <FormItem className="para:w-full para:flex-1">
                <FormLabel>Package Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="com.example.myapp" value={field.value ?? undefined} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Typography className="para:text-sm" color="secondary">
            There are 2 ways to find your Package Name
          </Typography>
          <span className="para:text-sm para:mt-2 para:text-secondary-foreground para:break-all">
            <strong>Android Studio</strong>
            <ol className="para:list-decimal para:list-inside">
              <li>
                Open <span className="para:text-primary para:font-[DM_Mono]">app/build.gradle</span>
              </li>
              <li>
                Under <span className="para:text-primary para:font-[DM_Mono]">defaultConfig</span>, find{' '}
                <span className="para:text-primary para:font-[DM_Mono]">applicationID “com.example.myapp”</span>
              </li>
            </ol>
          </span>
          <span className="para:text-sm para:mt-2 para:text-secondary-foreground para:break-all">
            <strong>AndroidManifest</strong>
            <ol className="para:list-decimal para:list-inside">
              <li>
                Open <span className="para:text-primary para:font-[DM_Mono]">app/src/main/AndroidManifest.xml</span>
              </li>
              <li>
                Check the <span className="para:text-primary para:font-[DM_Mono]">{'<manifest>'}</span> element’s{' '}
                <span className="para:text-primary para:font-[DM_Mono]">package=”com.example.myapp”</span> attribute
              </li>
            </ol>
          </span>
        </div>
        <div className="para:flex-1 para:flex-col para:gap-2">
          <FormField
            control={form.control}
            name="androidSha256CertFingerprints"
            render={({ field }) => (
              <FormItem className="para:w-full para:flex-1">
                <FormLabel>SHA256 Fingerprint</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? undefined}
                    placeholder="Paste SHA256 fingerprint here"
                    className="para:resize-none para:h-[112px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Typography className="para:text-sm" color="secondary">
            There are 2 ways to get your SHA256 Fingerprint
          </Typography>
          <span className="para:text-sm para:mt-2 para:text-secondary-foreground">
            <strong>Play Console</strong>
            <ol className="para:list-decimal para:list-inside">
              <li>Go to Setup → App integrity</li>
              <li>Under “App signing key certificate”, click “View certificate” and copy the SHA-256 line</li>
            </ol>
          </span>
          <span className="para:text-sm para:mt-2 para:text-secondary-foreground">
            <strong>Local Build (Keytool)</strong>
            <ol className="para:list-decimal para:list-inside">
              <li>Use the Keytool command to extract the SHA-256 fingerprint from your keystore:</li>
            </ol>
          </span>
          <CopyTextarea
            value={`keytool -list -v \\\n-keystore <keystore path> \\\n-alias <key alias> \\\n-storepass <store password> \\\n-keypass <keypassword>`}
            className="para:mt-2"
            disabled
            textareaClassName="para:disabled:opacity-100 para:disabled:cursor-text para:resize-none"
          />
        </div>
      </div>
    </>
  );
};
