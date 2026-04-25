import { api } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface EnvironmentVariable {
  id: number;
  key: string;
  value: string;
  description: string | null;
  secret: boolean;
  environmentId: string;
}

export interface EnvironmentSummary {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  environmentVariables: EnvironmentVariable[];
}

export interface GetEnvironmentsResponse {
  success: boolean;
  environments: EnvironmentSummary[];
}

export interface CreateVariablePayload {
  key: string;
  value: string;
  secret?: boolean;
  description?: string | null;
}

export interface UpdateVariablePayload {
  key?: string;
  value?: string;
  secret?: boolean;
  description?: string | null;
}

// ── Environment CRUD ─────────────────────────────────────────────────────────

export const getWorkspaceEnvironments = async (
  workspaceId: string
): Promise<GetEnvironmentsResponse> => {
  const response = await api.get(`/workspaces/${workspaceId}/environments`);
  return response.data;
};

export const createWorkspaceEnvironment = async (
  workspaceId: string,
  name: string
): Promise<{ success: boolean; newEnvironment: EnvironmentSummary }> => {
  const response = await api.post(`/workspaces/${workspaceId}/environments`, {
    name,
  });
  return response.data;
};

export const updateWorkspaceEnvironment = async (
  workspaceId: string,
  environmentId: string,
  name: string
): Promise<{ success: boolean; environment: EnvironmentSummary }> => {
  const response = await api.put(
    `/workspaces/${workspaceId}/environments/${environmentId}`,
    { name }
  );
  return response.data;
};

export const deleteWorkspaceEnvironment = async (
  workspaceId: string,
  environmentId: string
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/environments/${environmentId}`);
};

// ── Variable CRUD ────────────────────────────────────────────────────────────

export const createEnvVariable = async (
  workspaceId: string,
  environmentId: string,
  payload: CreateVariablePayload
): Promise<{ success: boolean; variable: EnvironmentVariable }> => {
  const response = await api.post(
    `/workspaces/${workspaceId}/environments/${environmentId}/variables`,
    payload
  );
  return response.data;
};

export const updateEnvVariable = async (
  workspaceId: string,
  environmentId: string,
  varId: number,
  payload: UpdateVariablePayload
): Promise<{ success: boolean; variable: EnvironmentVariable }> => {
  const response = await api.put(
    `/workspaces/${workspaceId}/environments/${environmentId}/variables/${varId}`,
    payload
  );
  return response.data;
};

export const deleteEnvVariable = async (
  workspaceId: string,
  environmentId: string,
  varId: number
): Promise<void> => {
  await api.delete(
    `/workspaces/${workspaceId}/environments/${environmentId}/variables/${varId}`
  );
};
