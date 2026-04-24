import { queryClient } from "@/app/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  deleteWorkspaceCollection,
  createWorkspaceCollection,
  createWorkspaceCollectionRequest,
  deleteWorkspaceCollectionRequest,
  getWorkspaceCollection,
  getWorkspaceCollections,
  updateWorkspaceCollectionRequest,
  type CreateCollectionPayload,
  type CollectionRequestPayload,
  type GetCollectionsResponse,
  type UpdateCollectionRequestPayload,
  type UpdateCollectionPayload,
  updateWorkspaceCollection,
} from "./api";

export const collectionKeys = {
  list: (workspaceId: string | null) =>
    ["workspaces", workspaceId, "collections"] as const,
  detail: (workspaceId: string | null, collectionId: number | null) =>
    ["workspaces", workspaceId, "collections", collectionId] as const,
};

export const useWorkspaceCollections = (
  workspaceId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: collectionKeys.list(workspaceId),
    queryFn: () => getWorkspaceCollections(workspaceId as string),
    enabled: enabled && !!workspaceId,
    staleTime: 30_000,
  });
};

export const useWorkspaceCollection = (
  workspaceId: string | null,
  collectionId: number | null,
  enabled = true
) => {
  return useQuery({
    queryKey: collectionKeys.detail(workspaceId, collectionId),
    queryFn: () =>
      getWorkspaceCollection(workspaceId as string, collectionId as number),
    enabled: enabled && !!workspaceId && !!collectionId,
    staleTime: 30_000,
  });
};

export const useCreateCollection = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      payload,
    }: {
      workspaceId: string;
      payload: CreateCollectionPayload;
    }) => createWorkspaceCollection(workspaceId, payload),
    onSuccess: (response, variables) => {
      queryClient.setQueryData<GetCollectionsResponse>(
        collectionKeys.list(variables.workspaceId),
        (current) => {
          const collections = current?.collections ?? [];
          const nextCollections = collections.filter(
            (collection) => collection.id !== response.collection.id
          );

          return {
            success: true,
            collections: [...nextCollections, response.collection],
          };
        }
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.list(variables.workspaceId),
      });
    },
  });
};

export const useUpdateCollection = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      collectionId,
      payload,
    }: {
      workspaceId: string;
      collectionId: number;
      payload: UpdateCollectionPayload;
    }) => updateWorkspaceCollection(workspaceId, collectionId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.list(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: collectionKeys.detail(
          variables.workspaceId,
          variables.collectionId
        ),
      });
    },
  });
};

export const useDeleteCollection = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      collectionId,
    }: {
      workspaceId: string;
      collectionId: number;
    }) => deleteWorkspaceCollection(workspaceId, collectionId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: collectionKeys.list(variables.workspaceId),
      });
      queryClient.removeQueries({
        queryKey: collectionKeys.detail(
          variables.workspaceId,
          variables.collectionId
        ),
      });
    },
  });
};

const invalidateCollectionDetail = (
  workspaceId: string,
  collectionId: number
) => {
  queryClient.invalidateQueries({
    queryKey: collectionKeys.detail(workspaceId, collectionId),
  });
};

export const useCreateCollectionRequest = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      collectionId,
      payload,
    }: {
      workspaceId: string;
      collectionId: number;
      payload: CollectionRequestPayload;
    }) => createWorkspaceCollectionRequest(workspaceId, collectionId, payload),
    onSuccess: (_response, variables) => {
      invalidateCollectionDetail(variables.workspaceId, variables.collectionId);
    },
  });
};

export const useUpdateCollectionRequest = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      collectionId,
      requestId,
      payload,
    }: {
      workspaceId: string;
      collectionId: number;
      requestId: number;
      payload: UpdateCollectionRequestPayload;
    }) =>
      updateWorkspaceCollectionRequest(
        workspaceId,
        collectionId,
        requestId,
        payload
      ),
    onSuccess: (_response, variables) => {
      invalidateCollectionDetail(variables.workspaceId, variables.collectionId);
    },
  });
};

export const useDeleteCollectionRequest = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      collectionId,
      requestId,
    }: {
      workspaceId: string;
      collectionId: number;
      requestId: number;
    }) =>
      deleteWorkspaceCollectionRequest(workspaceId, collectionId, requestId),
    onSuccess: (_response, variables) => {
      invalidateCollectionDetail(variables.workspaceId, variables.collectionId);
    },
  });
};
