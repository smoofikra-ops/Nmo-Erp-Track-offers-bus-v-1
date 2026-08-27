import { ApiResponse } from "@/types/responses";

export function getGasUrl(): string {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("CUSTOM_GAS_WEBAPP_URL");
    if (custom && custom.trim()) return custom.trim();
  }
  const envUrl =
    typeof process !== "undefined"
      ? process.env.VITE_GAS_WEBAPP_URL
      : (import.meta as any).env && (import.meta as any).env.VITE_GAS_WEBAPP_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim();
  return "https://script.google.com/macros/s/AKfycbzEsIMtuEO333KPSe607kKJ7OuHjzuJ42-0vKvTOJQOHKUGkFI3fAomDx7_PY-y1WVp/exec";
}

export interface ApiRequestOptions {
  timeoutMs?: number;
  retries?: number;
  dedup?: boolean;
}

// In-flight request deduplication map for concurrent read operations
const inFlightRequests = new Map<string, Promise<ApiResponse<any>>>();

export class ApiClient {
  private static getDedupKey(action: string, payload: any): string {
    try {
      if (!payload || typeof payload !== 'object') {
        return `${action.toUpperCase()}:${String(payload || '')}`;
      }
      // Normalize CompanyID / companyId
      const normalized: Record<string, any> = {};
      const sortedKeys = Object.keys(payload).sort();
      for (const k of sortedKeys) {
        const lowerKey = k.toLowerCase() === 'companyid' ? 'companyId' : k;
        normalized[lowerKey] = payload[k];
      }
      return `${action.toUpperCase()}:${JSON.stringify(normalized)}`;
    } catch {
      return `${action.toUpperCase()}:${String(payload)}`;
    }
  }

  private static isReadAction(action: string): boolean {
    const act = action.toUpperCase();
    return (
      act.startsWith('GET_') ||
      act === 'GET_OFFERS' ||
      act === 'GET_OFFER' ||
      act === 'GET_SYSTEM_HEALTH' ||
      act === 'GET_NOTIFICATION_SUMMARY' ||
      act === 'GET_FLEET_KPIS'
    );
  }

  private static async executeSingleRequest<T>(
    action: string,
    payload: any = {},
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const timeoutMs = options.timeoutMs || 25000;
    const currentUrl = getGasUrl();

    if (!currentUrl) {
      const errorMsg = "Google Apps Script Web App URL is not configured.";
      return {
        success: false,
        data: null as any,
        message: errorMsg,
        error: {
          code: "URL_NOT_CONFIGURED",
          details: errorMsg,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    let response: Response | null = null;
    let rawText = "";

    try {
      response = await fetch(currentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ action, payload }),
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      rawText = await response.text();

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseError: any) {
        console.warn(`[API Notice] ${action} (${durationMs}ms): Non-JSON response received.`);
        return {
          success: false,
          data: null as any,
          message: `فشل معالجة استجابة الخادم لطلب (${action}).`,
          error: {
            code: "JSON_PARSE_ERROR",
            details: `HTTP ${response.status}: Response is not valid JSON.`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      if (!response.ok && !parsedJson) {
        return {
          success: false,
          data: null as any,
          message: `خطأ اتصال بالخادم (${response.status})`,
          error: {
            code: `HTTP_${response.status}`,
            details: `HTTP status ${response.status}`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      if ((import.meta as any).env?.DEV) {
        const payloadSizeKb = (rawText.length / 1024).toFixed(1);
        const gasDiag = parsedJson?.diagnostics || parsedJson?._diagnostics;
        if (gasDiag) {
          console.debug(
            `[API Perf & GAS Diag] ${action} | Front: ${durationMs}ms | Size: ${payloadSizeKb} KB | GAS Total: ${gasDiag.totalExecutionMs || gasDiag.TOTAL || 'N/A'}ms`,
            gasDiag
          );
        } else {
          console.debug(`[API Perf] ${action} | ${durationMs}ms | ${payloadSizeKb} KB | HTTP ${response.status}`);
        }
      }

      return parsedJson as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      const isAbort = error.name === "AbortError";
      const errorCode = isAbort ? "TIMEOUT_ERROR" : "NETWORK_ERROR";
      const errorMessage = isAbort
        ? `انتهت مهلة انتظار استجابة الخادم (${Math.round(timeoutMs / 1000)} ثانية) لطلب ${action}.`
        : error?.message || "تعذر الاتصال بالخادم.";

      console.warn(`[API Notice] ${action} (${durationMs}ms, ${errorCode}):`, errorMessage);

      return {
        success: false,
        data: null as any,
        message: errorMessage,
        error: {
          code: errorCode,
          details: String(error?.message || error),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static async executeRequestWithRetry<T>(
    action: string,
    payload: any = {},
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const isRead = this.isReadAction(action);
    const maxRetries = options.retries !== undefined ? options.retries : (isRead ? 1 : 0);

    let attempt = 0;
    let res = await this.executeSingleRequest<T>(action, payload, options);

    while (!res.success && attempt < maxRetries) {
      const isRetryable =
        res.error?.code === 'TIMEOUT_ERROR' ||
        res.error?.code === 'NETWORK_ERROR' ||
        res.error?.code === 'JSON_PARSE_ERROR';

      if (!isRetryable) break;

      attempt++;
      // Controlled jittered delay: 1500ms + random 0-1000ms
      const backoffMs = 1500 + Math.floor(Math.random() * 1000);
      console.warn(`[API Smart Retry] Retrying ${action} (attempt ${attempt}/${maxRetries}) after ${backoffMs}ms delay...`);
      await new Promise((r) => setTimeout(r, backoffMs));

      res = await this.executeSingleRequest<T>(action, payload, options);
      if (res.success) {
        console.info(`[API Smart Retry] ${action} succeeded on retry attempt ${attempt}.`);
        break;
      }
    }

    return res;
  }

  private static async request<T>(
    action: string,
    payload: any = {},
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const shouldDedup = options.dedup !== false && this.isReadAction(action);
    const dedupKey = shouldDedup ? this.getDedupKey(action, payload) : null;

    if (dedupKey && inFlightRequests.has(dedupKey)) {
      if ((import.meta as any).env?.DEV) {
        console.debug(`[API Dedup] Reusing active in-flight request for: ${dedupKey}`);
      }
      return inFlightRequests.get(dedupKey) as Promise<ApiResponse<T>>;
    }

    const requestPromise = this.executeRequestWithRetry<T>(action, payload, options).finally(() => {
      if (dedupKey) {
        inFlightRequests.delete(dedupKey);
      }
    });

    if (dedupKey) {
      inFlightRequests.set(dedupKey, requestPromise);
    }

    return requestPromise;
  }

  static async get<T>(
    action: string,
    params: any = {},
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(action, params, options);
  }

  static async post<T>(
    action: string,
    data: any = {},
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(action, data, options);
  }
}


