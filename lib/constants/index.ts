export const VERSION = Date.now();

export const isDevelopment = process.env.NODE_ENV === "development";

export const WORKER_API_URL =
  process.env.NEXT_PUBLIC_WORKER_API_URL ||
  (isDevelopment
    ? "http://localhost:3001/api/v1"
    : "https://api.worker.com/api/v1");
