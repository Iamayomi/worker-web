import { worker } from "@/lib/api/worker";

export interface FetchPageResult<T> {
  items: T[];
  total: number;
}

/**
 * Fetches every page of a paginated endpoint and returns all items.
 * The request function must throw on failure.
 */
export async function fetchAllPages<T>(
  request: (page: number, limit: number) => Promise<FetchPageResult<T>>,
): Promise<T[]> {
  const limit = 100;
  const all: T[] = [];
  let page = 1;
  let total = Infinity;

  while (all.length < total) {
    const result = await request(page, limit);
    all.push(...result.items);
    total = result.total;
    if (result.items.length === 0) break;
    page += 1;
  }

  return all;
}

export function assertSuccess(res: { success: boolean; message?: string }) {
  if (!res.success) throw new Error(res.message || "Failed to fetch data");
}

export { worker };
