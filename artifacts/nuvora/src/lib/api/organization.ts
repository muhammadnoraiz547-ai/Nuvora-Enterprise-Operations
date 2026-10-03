import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrganizationHeaders } from '../api-client-config';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
}

export interface OrganizationUpdate {
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchCurrentOrganization(): Promise<Organization> {
  try {
    const headers = getOrganizationHeaders();
    const response = await fetch(`${API_URL}/api/v1/organizations/current`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organization');
    }

    return response.json();
  } catch (error) {
    // If the API is not available or organization ID is not set, throw error to trigger fallback
    throw new Error('API unavailable - using demo data');
  }
}

async function updateCurrentOrganization(data: OrganizationUpdate): Promise<Organization> {
  try {
    const headers = {
      ...getOrganizationHeaders(),
      'Content-Type': 'application/json',
    };
    const response = await fetch(`${API_URL}/api/v1/organizations/current`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update organization');
    }

    return response.json();
  } catch (error) {
    // If the API is not available, throw error to trigger fallback
    throw new Error('API unavailable - using demo data');
  }
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: ['organization', 'current'],
    queryFn: fetchCurrentOrganization,
    retry: false,
    // Don't throw error - let the component handle the fallback
    throwOnError: false,
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'current'] });
    },
    // Don't throw error - let the component handle the fallback
    throwOnError: false,
  });
}
