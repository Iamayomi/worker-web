import type { IApiResponse } from "../auth/types";
import { useAuthStore } from "@/store/authStore";

const WORKER_API =
	process.env.NEXT_PUBLIC_WORKER_API_URL || "http://localhost:3001/api/v1";

let accessToken: string | null = null;
let refreshToken: string | null = null;

const REMEMBER_FLAG = "worker_remember";

function isRemembered() {
	if (typeof window === "undefined") return true;
	return window.localStorage.getItem(REMEMBER_FLAG) === "true";
}

export function setTokens(access: string, refresh: string, remember = true) {
	accessToken = access;
	refreshToken = refresh;
	const existing = useAuthStore.getState().tokens;
	if (
		!existing ||
		existing.access_token !== access ||
		existing.refresh_token !== refresh
	) {
		useAuthStore
			.getState()
			.setTokens(
				existing
					? { ...existing, access_token: access, refresh_token: refresh }
					: {
							access_token: access,
							refresh_token: refresh,
							expires_in: 0,
							token_type: "Bearer",
						},
			);
	}
	if (typeof window !== "undefined") {
		const store = remember ? window.localStorage : window.sessionStorage;
		store.setItem("worker_access_token", access);
		store.setItem("worker_refresh_token", refresh);
	}
}

export function clearTokens() {
	accessToken = null;
	refreshToken = null;
	useAuthStore.getState().clear();
	if (typeof window !== "undefined") {
		window.localStorage.removeItem("worker_access_token");
		window.localStorage.removeItem("worker_refresh_token");
		window.sessionStorage.removeItem("worker_access_token");
		window.sessionStorage.removeItem("worker_refresh_token");
	}
}

export function loadTokens() {
	if (typeof window !== "undefined") {
		const remember = isRemembered();
		const store = remember ? window.localStorage : window.sessionStorage;
		accessToken = store.getItem("worker_access_token");
		refreshToken = store.getItem("worker_refresh_token");
	}
}

async function refreshAccessToken(): Promise<boolean> {
	if (!refreshToken) return false;
	try {
		const res = await fetch(`${WORKER_API}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh_token: refreshToken }),
		});
		if (!res.ok) return false;
		const json: IApiResponse<{ access_token: string; refresh_token: string }> =
			await res.json();
		if (json.success && json.data) {
			setTokens(json.data.access_token, json.data.refresh_token);
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

async function request<T>(
	method: string,
	path: string,
	body?: unknown,
	authenticated = false,
): Promise<IApiResponse<T>> {
	const url = `${WORKER_API}${path}`;
	const isFormData =
		typeof FormData !== "undefined" && body instanceof FormData;
	const headers: Record<string, string> = {};

	if (!isFormData) {
		headers["Content-Type"] = "application/json";
	}

	if (authenticated && accessToken) {
		headers["Authorization"] = `Bearer ${accessToken}`;
	}

	let res = await fetch(url, {
		method,
		headers,
		body: isFormData ? body : body ? JSON.stringify(body) : undefined,
	});

	if (res.status === 401 && authenticated && refreshToken) {
		const refreshed = await refreshAccessToken();
		if (refreshed && accessToken) {
			headers["Authorization"] = `Bearer ${accessToken}`;
			res = await fetch(url, {
				method,
				headers,
				body: isFormData ? body : body ? JSON.stringify(body) : undefined,
			});
		} else {
			clearTokens();
		}
	} else if (res.status === 401 && authenticated && !refreshToken) {
		clearTokens();
	}

	const json = await res.json().catch(() => ({}));
	return {
		success: res.ok,
		message: json.message,
		data: json.data ?? json,
		errors: json.errors,
	} as IApiResponse<T>;
}

export const worker = {
	get: <T>(path: string) => request<T>("GET", path),
	post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
	patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
	delete: <T>(path: string) => request<T>("DELETE", path),

	auth: {
		get: <T>(path: string) => request<T>("GET", path, undefined, true),
		post: <T>(path: string, body?: unknown) =>
			request<T>("POST", path, body, true),
		patch: <T>(path: string, body?: unknown) =>
			request<T>("PATCH", path, body, true),
		delete: <T>(path: string) => request<T>("DELETE", path, undefined, true),
		upload: <T>(path: string, body: FormData) =>
			request<T>("POST", path, body, true),
	},
};
