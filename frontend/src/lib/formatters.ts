export const formatBytes = (bytes: number | null) => {
  if (bytes === null || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatMs = (ms: number | null) => {
  if (ms === null) return "0 ms";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
};

export const getStatusColor = (status: number | null) => {
  if (!status) return "text-muted-foreground";
  if (status >= 200 && status < 300) return "text-emerald-500";
  if (status >= 400 && status < 500) return "text-amber-500";
  if (status >= 500) return "text-rose-500";
  return "text-muted-foreground";
};
