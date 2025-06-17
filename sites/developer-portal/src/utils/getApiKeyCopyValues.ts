import { ApiKey } from '../types/api';
import { Environment } from '../types/environment';

export function getApiKeyCopyValues({
  key,
  nextEnv,
  hasNativePasskeyAccess,
}: {
  key: ApiKey;
  nextEnv: Environment;
  hasNativePasskeyAccess?: boolean;
}) {
  const isNextEnvProd = nextEnv.toUpperCase() === Environment.PROD;

  const {
    environment: _environment,
    id: _id,
    apiKey: _apiKey,
    secretApiKey: _secretApiKey,
    archived: _archived,
    onboarding: _onboarding,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    projectId: _projectId,
    organizationId: _organizationId,
    isUsed: _isUsed,
    isInstalled: _isInstalled,

    ...rest
  } = key;

  if (!isNextEnvProd && !hasNativePasskeyAccess) {
    rest.teamId = null;
    rest.bundleIdentifier = null;
    rest.androidPackageName = null;
    rest.androidSha256CertFingerprints = null;
  }

  return rest;
}
