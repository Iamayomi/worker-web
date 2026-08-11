import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type InternalAxiosRequestConfig,
} from "axios";
import type { IApiResponse } from "../auth/types";
import { useAuthStore } from "@/store/authStore";

const WORKER_API =
	process.env.NEXT_PUBLIC_WORKER_API_URL || "http://localhost:3001/api/v1";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
	status?: number;
	errors?: Record<string, string[]>;

	constructor(
		message?: string,
		status?: number,
		errors?: Record<string, string[]>,
	) {
		super(message || "Something went wrong");
		this.name = "ApiError";
		this.status = status;
		this.errors = errors;
	}
}

export function errorMessage(error: unknown, fallback: string): string {
	if (error instanceof ApiError) return error.message || fallback;
	if (error instanceof Error) return error.message || fallback;
	return fallback;
}

const REMEMBER_FLAG = "worker_remember";

function isRemembered() {
	if (typeof window === "undefined") return true;
	return window.localStorage.getItem(REMEMBER_FLAG) === "true";
}

function storageFor(remember: boolean): Storage | null {
	if (typeof window === "undefined") return null;
	return remember ? window.localStorage : window.sessionStorage;
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
		useAuthStore.getState().setTokens(
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
	storageFor(remember)?.setItem("worker_access_token", access);
	storageFor(remember)?.setItem("worker_refresh_token", refresh);
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
		// Remove the zustand-persisted store from BOTH storages so the
		// header and auth hooks cannot revive it.
		window.localStorage.removeItem("auth-storage");
		window.sessionStorage.removeItem("auth-storage");
	}
}

export function loadTokens() {
	if (typeof window !== "undefined") {
		const remember = isRemembered();
		const store = storageFor(remember);
		accessToken = store?.getItem("worker_access_token") ?? null;
		refreshToken = store?.getItem("worker_refresh_token") ?? null;
	}
}

function currentAccessToken(): string | null {
	return accessToken ?? useAuthStore.getState().tokens?.access_token ?? null;
}

function currentRefreshToken(): string | null {
	return (
		refreshToken ?? useAuthStore.getState().tokens?.refresh_token ?? null
	);
}

export interface ApiClientRequestConfig extends AxiosRequestConfig {
	_authenticated?: boolean;
}

type RetryConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
	_authenticated?: boolean;
};

// Bare client for the refresh call so a failed refresh can't re-enter the
// 401 interceptor and loop.
const refreshClient: AxiosInstance = axios.create({ baseURL: WORKER_API });

async function refreshAccessToken(): Promise<boolean> {
	const token = currentRefreshToken();
	if (!token) return false;

	if (!refreshPromise) {
		refreshPromise = (async () => {
			try {
				const res = await refreshClient.post<
					IApiResponse<{ access_token: string; refresh_token: string }>
				>("/auth/refresh", { refresh_token: token });
				const json = res.data;
				if (json.success && json.data) {
					setTokens(json.data.access_token, json.data.refresh_token);
					return true;
				}
				return false;
			} catch {
				return false;
			}
		})().finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise;
}

class ApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({ baseURL: WORKER_API });

		// Request interceptor - Attach the Bearer token from the zustand
		// store for authenticated requests.
		this.client.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				const authConfig = config as InternalAxiosRequestConfig &
					ApiClientRequestConfig;
				if (authConfig._authenticated) {
					const token = currentAccessToken();
					if (token) {
						config.headers.set("Authorization", `Bearer ${token}`);
					}
				}
				return config;
			},
			(error: unknown) => Promise.reject(error),
		);

		// Response interceptor - Handle 401 by refreshing once and replaying
		// the request. If refresh fails the session is dead, so drop the
		// tokens and send the user back to login.
		this.client.interceptors.response.use(
			(response) => response,
			async (error: unknown) => {
				if (!axios.isAxiosError(error)) return Promise.reject(error);
				const original = error.config as RetryConfig | undefined;

				if (
					error.response?.status === 401 &&
					original?._authenticated
				) {
					if (!original._retry) {
						original._retry = true;
						const refreshed = await refreshAccessToken();
						if (refreshed && currentAccessToken()) {
							original.headers.set(
								"Authorization",
								`Bearer ${currentAccessToken()}`,
							);
							return this.client(original);
						}
					}

					clearTokens();
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}
				}

				return Promise.reject(error);
			},
		);
	}

	private toEnvelope<T>(error: unknown): IApiResponse<T> {
		if (axios.isAxiosError<IApiResponse<T>>(error) && error.response?.data) {
			const data = error.response.data;
			return {
				success: false,
				message:
					data.message ??
					error.response.statusText ??
					"Something went wrong",
				data: data.data as T,
				errors: data.errors,
			};
		}
		throw error;
	}

	async get<T = unknown>(
		url: string,
		config?: ApiClientRequestConfig,
	): Promise<IApiResponse<T>> {
		try {
			return (await this.client.get<IApiResponse<T>>(url, config)).data;
		} catch (error) {
			return this.toEnvelope<T>(error);
		}
	}

	async post<T = unknown>(
		url: string,
		data?: unknown,
		config?: ApiClientRequestConfig,
	): Promise<IApiResponse<T>> {
		try {
			return (
				await this.client.post<IApiResponse<T>>(url, data, config)
			).data;
		} catch (error) {
			return this.toEnvelope<T>(error);
		}
	}

	async put<T = unknown>(
		url: string,
		data?: unknown,
		config?: ApiClientRequestConfig,
	): Promise<IApiResponse<T>> {
		try {
			return (
				await this.client.put<IApiResponse<T>>(url, data, config)
			).data;
		} catch (error) {
			return this.toEnvelope<T>(error);
		}
	}

	async patch<T = unknown>(
		url: string,
		data?: unknown,
		config?: ApiClientRequestConfig,
	): Promise<IApiResponse<T>> {
		try {
			return (
				await this.client.patch<IApiResponse<T>>(url, data, config)
			).data;
		} catch (error) {
			return this.toEnvelope<T>(error);
		}
	}

	async delete<T = unknown>(
		url: string,
		config?: ApiClientRequestConfig,
	): Promise<IApiResponse<T>> {
		try {
			return (
				await this.client.delete<IApiResponse<T>>(url, config)
			).data;
		} catch (error) {
			return this.toEnvelope<T>(error);
		}
	}
}

export const apiClient = new ApiClient();
export default apiClient;

export const api = {
	get: <T>(path: string) => apiClient.get<T>(path),
	post: <T>(path: string, body?: unknown) => apiClient.post<T>(path, body),
	patch: <T>(path: string, body?: unknown) =>
		apiClient.patch<T>(path, body),
	delete: <T>(path: string) => apiClient.delete<T>(path),

	auth: {
		get: <T>(path: string) =>
			apiClient.get<T>(path, { _authenticated: true }),
		post: <T>(path: string, body?: unknown) =>
			apiClient.post<T>(path, body, { _authenticated: true }),
		patch: <T>(path: string, body?: unknown) =>
			apiClient.patch<T>(path, body, { _authenticated: true }),
		delete: <T>(path: string, body?: unknown) =>
			apiClient.delete<T>(path, {
				_authenticated: true,
				data: body,
			}),
		upload: <T>(path: string, body: FormData) =>
			apiClient.post<T>(path, body, { _authenticated: true }),
	},
};
