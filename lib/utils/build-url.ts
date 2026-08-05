export function buildUrl(path: string, params: object): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      q.set(key, String(value));
    }
  });
  const query = q.toString();
  return query ? `${path}?${query}` : path;
}
