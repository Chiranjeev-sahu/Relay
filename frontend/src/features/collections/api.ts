import { api } from "@/lib/api-client";
import type { HttpMethod } from "@/features/request-composer/store";

export interface CollectionRequestSummary {
  id: number;
  name: string;
  method: string;
  url: string;
  headers: unknown;
  body: unknown;
  collectionId: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSummary {
  id: number;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCollectionsResponse {
  success: boolean;
  collections: CollectionSummary[];
}

export interface GetCollectionResponse {
  success: boolean;
  collection: CollectionSummary;
  allRequests: CollectionRequestSummary[];
}

export interface CreateCollectionPayload {
  name: string;
  description?: string | null;
}

export interface CreateCollectionResponse {
  success: boolean;
  message: string;
  collection: CollectionSummary;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string | null;
}

export interface UpdateCollectionResponse {
  success: boolean;
  collection: CollectionSummary;
}

export interface CollectionRequestPayload {
  name: string;
  method: string;
  url: string;
  headers?: unknown;
  body?: unknown;
}

export interface CreateCollectionRequestResponse {
  success: boolean;
  newRequest: CollectionRequestSummary;
}

export interface UpdateCollectionRequestPayload {
  name?: string;
  method?: string;
  url?: string;
  headers?: unknown;
  body?: unknown;
}

export interface UpdateCollectionRequestResponse {
  success: boolean;
  collectionRequest: CollectionRequestSummary;
}

export interface LoadCollectionRequestDraft {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

export const getWorkspaceCollections = async (
  workspaceId: string
): Promise<GetCollectionsResponse> => {
  const response = await api.get(`/workspaces/${workspaceId}/collections`);
  return response.data;
};

export const getWorkspaceCollection = async (
  workspaceId: string,
  collectionId: number
): Promise<GetCollectionResponse> => {
  const response = await api.get(
    `/workspaces/${workspaceId}/collections/${collectionId}`
  );
  return response.data;
};

export const createWorkspaceCollection = async (
  workspaceId: string,
  payload: CreateCollectionPayload
): Promise<CreateCollectionResponse> => {
  const response = await api.post(
    `/workspaces/${workspaceId}/collections`,
    payload
  );
  return response.data;
};

export const updateWorkspaceCollection = async (
  workspaceId: string,
  collectionId: number,
  payload: UpdateCollectionPayload
): Promise<UpdateCollectionResponse> => {
  const response = await api.put(
    `/workspaces/${workspaceId}/collections/${collectionId}`,
    payload
  );
  return response.data;
};

export const deleteWorkspaceCollection = async (
  workspaceId: string,
  collectionId: number
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/collections/${collectionId}`);
};

export const createWorkspaceCollectionRequest = async (
  workspaceId: string,
  collectionId: number,
  payload: CollectionRequestPayload
): Promise<CreateCollectionRequestResponse> => {
  const response = await api.post(
    `/workspaces/${workspaceId}/collections/${collectionId}/requests`,
    payload
  );

  return response.data;
};

export const updateWorkspaceCollectionRequest = async (
  workspaceId: string,
  collectionId: number,
  requestId: number,
  payload: UpdateCollectionRequestPayload
): Promise<UpdateCollectionRequestResponse> => {
  const response = await api.put(
    `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}`,
    payload
  );

  return response.data;
};

export const deleteWorkspaceCollectionRequest = async (
  workspaceId: string,
  collectionId: number,
  requestId: number
): Promise<void> => {
  await api.delete(
    `/workspaces/${workspaceId}/collections/${collectionId}/requests/${requestId}`
  );
};
