import {
  setAuthTokenGetter,
  setBaseUrl,
  type AuthTokenGetter,
} from '@workspace/api-client-react';

let accessTokenProvider: AuthTokenGetter = () => null;
let activeOrganizationProvider = () =>
  process.env.NEXT_PUBLIC_ORGANIZATION_ID?.trim() || null;

setBaseUrl(process.env.NEXT_PUBLIC_API_URL?.trim() || null);
setAuthTokenGetter(() => accessTokenProvider());

export function configureApiAccessTokenProvider(provider: AuthTokenGetter) {
  accessTokenProvider = provider;
}

export function configureActiveOrganizationProvider(provider: () => string | null) {
  activeOrganizationProvider = provider;
}

export function getActiveOrganizationId(): string | null {
  return activeOrganizationProvider();
}

export function getOrganizationHeaders(): HeadersInit {
  const organizationId = getActiveOrganizationId();
  if (!organizationId) {
    throw new Error('Choose an active organization before loading Tasks.');
  }
  return { 'Organization-ID': organizationId };
}