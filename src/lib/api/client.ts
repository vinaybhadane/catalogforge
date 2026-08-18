import { ApiErrorResponse } from "@/types";

export interface ApiClientConfig {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | null>;
  timeoutMs?: number;
}

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorResponse["details"];
  public readonly rawPayload?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ApiErrorResponse["details"],
    rawPayload?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.rawPayload = rawPayload;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

export class ApiClient {
  private baseUrl: string;
  private getAccessToken?: () => Promise<string | null>;
  private defaultTimeoutMs: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    this.getAccessToken = config.getAccessToken;
    this.defaultTimeoutMs = config.timeoutMs || 30000;
  }

  /**
   * Set token getter callback dynamically (e.g. Firebase Auth token resolution)
   */
  public setAccessTokenProvider(provider: () => Promise<string | null>) {
    this.getAccessToken = provider;
  }

  private async getHeaders(body?: unknown, customHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers(customHeaders);
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    if (!isFormData && !headers.has("Content-Type") && typeof body !== "string") {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (this.getAccessToken) {
      try {
        const token = await this.getAccessToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (err) {
        console.warn("Failed to resolve authentication token for API client request:", err);
      }
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`, typeof window !== "undefined" ? window.location.origin : "http://localhost");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Return relative or full string depending on baseUrl environment
    if (this.baseUrl.startsWith("http")) {
      return url.toString();
    }
    return `${url.pathname}${url.search}`;
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, headers: customHeaders, timeoutMs = this.defaultTimeoutMs, signal: customSignal, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Merge external signal with timeout signal
    if (customSignal) {
      customSignal.addEventListener("abort", () => controller.abort());
    }

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const headers = await this.getHeaders(body, customHeaders);
    
    // If FormData, let the browser/fetch automatically assign the multipart boundary
    if (isFormData) {
      headers.delete("Content-Type");
    }

    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: isFormData
          ? (body as BodyInit)
          : body !== undefined
          ? (typeof body === "string" ? body : JSON.stringify(body))
          : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const rawData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        // Normalize error shape
        if (typeof rawData === "object" && rawData !== null) {
          const errObj = rawData as Partial<ApiErrorResponse>;
          throw new ApiClientError(
            response.status,
            errObj.code || `HTTP_${response.status}`,
            errObj.message || response.statusText || "API Request Failed",
            errObj.details,
            rawData
          );
        }

        throw new ApiClientError(
          response.status,
          `HTTP_${response.status}`,
          typeof rawData === "string" ? rawData : response.statusText || "API Request Failed",
          undefined,
          rawData
        );
      }

      return rawData as T;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof ApiClientError) {
        throw err;
      }

      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiClientError(408, "TIMEOUT", `Request timed out after ${timeoutMs}ms`);
      }

      throw new ApiClientError(
        500,
        "NETWORK_ERROR",
        err instanceof Error ? err.message : "An unexpected network error occurred"
      );
    }
  }

  public get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T>(endpoint: string, options?: Omit<RequestOptions, "method">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
