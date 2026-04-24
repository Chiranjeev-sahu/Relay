import {
  useCreateCollection,
  useCreateCollectionRequest,
  useDeleteCollection,
  useDeleteCollectionRequest,
  useUpdateCollection,
  useUpdateCollectionRequest,
  useWorkspaceCollection,
  useWorkspaceCollections,
} from "../hooks";
import {
  getBodyValidationError,
  useComposerStore,
  type HttpMethod,
} from "@/features/request-composer/store";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useWorkspaceStore } from "@/features/workspace/store";
import {
  createHeaderRows,
  serializeBody,
} from "@/features/workspace/components/workspace-panel-utils";

export function useCollectionsTab(workspaceId: string, isActive: boolean) {
  const loadDraft = useComposerStore((state) => state.loadDraft);
  const composerMethod = useComposerStore((state) => state.method);
  const composerUrl = useComposerStore((state) => state.url);
  const composerHeaders = useComposerStore((state) => state.headers);
  const composerBodyType = useComposerStore((state) => state.bodyType);
  const composerBody = useComposerStore((state) => state.body);

  const activeCollectionId = useWorkspaceStore(
    (state) => state.activeCollectionByWorkspaceId[workspaceId] ?? null
  );
  const setActiveCollection = useWorkspaceStore(
    (state) => state.setActiveCollection
  );

  const [searchText, setSearchText] = useState("");
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [requestName, setRequestName] = useState("");
  const [collectionToDelete, setCollectionToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<{
    collectionId: number;
    requestId: number;
    name: string;
  } | null>(null);

  const [renameCollection, setRenameCollection] = useState<{
    id: number;
    name: string;
    description: string | null;
  } | null>(null);
  const [renameCollectionName, setRenameCollectionName] = useState("");
  const [renameCollectionDescription, setRenameCollectionDescription] =
    useState("");

  const [renameRequest, setRenameRequest] = useState<{
    collectionId: number;
    requestId: number;
    name: string;
  } | null>(null);
  const [renameRequestName, setRenameRequestName] = useState("");

  const collectionsQuery = useWorkspaceCollections(workspaceId, isActive);
  const isValidCollectionId =
    typeof activeCollectionId === "number" && activeCollectionId > 0;
  const selectedCollectionQuery = useWorkspaceCollection(
    workspaceId,
    isValidCollectionId ? activeCollectionId : null,
    isActive && isValidCollectionId
  );

  const collections = useMemo(
    () => collectionsQuery.data?.collections ?? [],
    [collectionsQuery.data?.collections]
  );
  const normalizedSearch = searchText.trim().toLowerCase();
  const composerBodyValidationError = getBodyValidationError(
    composerBodyType,
    composerBody
  );

  const visibleCollections = useMemo(() => {
    if (!normalizedSearch) return collections;
    return collections.filter((collection) => {
      const collectionMatches =
        collection.name.toLowerCase().includes(normalizedSearch) ||
        (collection.description ?? "").toLowerCase().includes(normalizedSearch);
      return collectionMatches || collection.id === activeCollectionId;
    });
  }, [activeCollectionId, collections, normalizedSearch]);

  const { mutateAsync: createCollection, isPending: isCreatingCollection } =
    useCreateCollection();
  const {
    mutateAsync: createCollectionRequest,
    isPending: isCreatingCollectionRequest,
  } = useCreateCollectionRequest();
  const { mutateAsync: deleteCollection, isPending: isDeletingCollection } =
    useDeleteCollection();
  const {
    mutateAsync: deleteCollectionRequest,
    isPending: isDeletingCollectionRequest,
  } = useDeleteCollectionRequest();
  const { mutateAsync: updateCollection, isPending: isRenamingCollection } =
    useUpdateCollection();
  const { mutateAsync: updateCollectionRequest, isPending: isRenamingRequest } =
    useUpdateCollectionRequest();

  useEffect(() => {
    if (!workspaceId || !collections.length) return;
    const selectedExists = collections.some((c) => c.id === activeCollectionId);
    if (!isValidCollectionId || !selectedExists) {
      setActiveCollection(workspaceId, collections[0].id);
    }
  }, [
    activeCollectionId,
    collections,
    isValidCollectionId,
    setActiveCollection,
    workspaceId,
  ]);

  const handleCreateCollection = async () => {
    const name = collectionName.trim();
    if (!name) return;

    const response = await createCollection({
      workspaceId,
      payload: {
        name,
        description: collectionDescription.trim() || null,
      },
    });

    setActiveCollection(workspaceId, response.collection.id);
    setCollectionName("");
    setCollectionDescription("");
    setIsCreateCollectionOpen(false);
  };

  const handleCreateRequest = async () => {
    if (!isValidCollectionId) return;

    const name = requestName.trim();
    const url = composerUrl.trim();
    if (!name || !url || composerBodyValidationError) return;

    let body: unknown = null;
    if (composerBodyType !== "none") {
      const trimmedBody = composerBody.trim();
      if (trimmedBody) {
        try {
          body = JSON.parse(trimmedBody);
        } catch {
          body = trimmedBody;
        }
      }
    }

    await createCollectionRequest({
      workspaceId,
      collectionId: activeCollectionId as number,
      payload: {
        name,
        method: composerMethod,
        url,
        headers: composerHeaders,
        body,
      },
    });

    setRequestName("");
    setIsCreateRequestOpen(false);
  };

  const handleLoadSavedRequest = (request: {
    name: string;
    method: string;
    url: string;
    headers: unknown;
    body: unknown;
  }) => {
    loadDraft({
      name: request.name,
      method: request.method as HttpMethod,
      url: request.url,
      headers: createHeaderRows(request.headers),
      body: serializeBody(request.body),
    });
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    await deleteCollection({
      workspaceId,
      collectionId: collectionToDelete.id,
    });
    if (activeCollectionId === collectionToDelete.id) {
      setActiveCollection(workspaceId, null);
    }
  };

  const handleDeleteCollectionRequest = async () => {
    if (!requestToDelete) return;
    await deleteCollectionRequest({
      workspaceId,
      collectionId: requestToDelete.collectionId,
      requestId: requestToDelete.requestId,
    });
  };

  const openRenameCollection = (collection: {
    id: number;
    name: string;
    description: string | null;
  }) => {
    setRenameCollection(collection);
    setRenameCollectionName(collection.name);
    setRenameCollectionDescription(collection.description ?? "");
  };

  const handleRenameCollection = async () => {
    if (!renameCollection) return;
    const name = renameCollectionName.trim();
    if (!name) return;

    try {
      await updateCollection({
        workspaceId,
        collectionId: renameCollection.id,
        payload: {
          name,
          description: renameCollectionDescription.trim() || undefined,
        },
      });
      toast.success("Collection updated");
      setRenameCollection(null);
    } catch {
      toast.error("Failed to update collection");
    }
  };

  const openRenameRequest = (req: {
    collectionId: number;
    requestId: number;
    name: string;
  }) => {
    setRenameRequest(req);
    setRenameRequestName(req.name);
  };

  const handleRenameRequest = async () => {
    if (!renameRequest) return;
    const name = renameRequestName.trim();
    if (!name) return;

    try {
      await updateCollectionRequest({
        workspaceId,
        collectionId: renameRequest.collectionId,
        requestId: renameRequest.requestId,
        payload: { name },
      });
      toast.success("Request renamed");
      setRenameRequest(null);
    } catch {
      toast.error("Failed to rename request");
    }
  };

  return {
    collectionsQuery,
    selectedCollectionQuery,
    collections,
    visibleCollections,
    activeCollectionId,
    setActiveCollection,
    normalizedSearch,

    isCreateCollectionOpen,
    setIsCreateCollectionOpen,
    collectionName,
    setCollectionName,
    collectionDescription,
    setCollectionDescription,
    isCreatingCollection,
    handleCreateCollection,

    isCreateRequestOpen,
    setIsCreateRequestOpen,
    requestName,
    setRequestName,
    isCreatingCollectionRequest,
    composerUrl,
    composerBodyValidationError,
    handleCreateRequest,

    searchText,
    setSearchText,

    collectionToDelete,
    setCollectionToDelete,
    requestToDelete,
    setRequestToDelete,
    isDeletingCollection,
    isDeletingCollectionRequest,
    handleDeleteCollection,
    handleDeleteCollectionRequest,

    handleLoadSavedRequest,

    renameCollection,
    setRenameCollection,
    renameCollectionName,
    setRenameCollectionName,
    renameCollectionDescription,
    setRenameCollectionDescription,
    isRenamingCollection,
    handleRenameCollection,
    openRenameCollection,

    renameRequest,
    setRenameRequest,
    renameRequestName,
    setRenameRequestName,
    isRenamingRequest,
    handleRenameRequest,
    openRenameRequest,
  };
}
