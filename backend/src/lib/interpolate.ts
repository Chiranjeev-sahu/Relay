export function interpolate(
  template: string,
  variables: Array<{ key: string; value: string }>
): string {
  const varMap: Record<string, string> = {};
  variables.forEach((v) => {
    varMap[v.key] = v.value;
  });

  const regex = /{{(.*?)}}/g;

  return template.replace(regex, (match, key) => {
    const cleanKey = key.trim();

    const resolvedValue = varMap[cleanKey];

    if (resolvedValue === undefined) {
      throw new Error(`Variable '{{${cleanKey}}}' not found in your environment.`);
    }

    return resolvedValue;
  });
}

export function interpolateValue<T>(obj: T, variables: Array<{ key: string; value: string }>): T {
  if (!obj) return obj;
  if (typeof obj === "string") return interpolate(obj, variables) as unknown as T;

  try {
    const stringified = JSON.stringify(obj);
    const resolved = interpolate(stringified, variables);
    return JSON.parse(resolved);
  } catch (err) {
    return obj;
  }
}
