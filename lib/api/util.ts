import { API_BASE_URL } from "../constants";

async function readJsonResponse<T>(res: Response): Promise<T | undefined> {
  try {
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(
  path: string,
  query?: object
): Promise<T | undefined> {
  try {
    const url = new URL(`${API_BASE_URL}${path}`);

    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.map(String).join(","));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    const res = await fetch(url.toString(), {
      credentials: "include",
    });
    return readJsonResponse<T>(res);
  } catch (err) {
    console.error(`API fetch failed for ${path}:`, err);
    return undefined;
  }
}

export async function apiPost<T>(
  path: string,
  body?: object
): Promise<T | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

    return readJsonResponse<T>(res);
  } catch (err) {
    console.error(`API post failed for ${path}:`, err);
    return undefined;
  }
}
