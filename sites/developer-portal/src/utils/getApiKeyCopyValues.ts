import { ApiKey } from '../types/api';

export function getApiKeyCopyValues(obj: ApiKey) {
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
  } = obj;
  return rest;
}
