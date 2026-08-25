import { ApiResponse } from "@/types/responses";

// Try to get URL from import.meta.env, fallback to the known URL if missing during dev
const GAS_URL =
  (typeof process !== 'undefined' ? process.env.VITE_GAS_WEBAPP_URL : ((import.meta as any).env && (import.meta as any).env.VITE_GAS_WEBAPP_URL)) ||
  "https://script.google.com/macros/s/AKfycbzEsIMtuEO333KPSe607kKJ7OuHjzuJ42-0vKvTOJQOHKUGkFI3fAomDx7_PY-y1WVp/exec";

export interface ApiRequestOptions {
  timeoutMs?: number;
  retries?: number;
}

export class ApiClient {
  private static async request<T>(
    action: string,
    payload: any = {},
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const companyId = payload?.CompanyID || payload?.companyId || "COM-0001";
    const timeoutMs = options.timeoutMs || 25000; // 25 seconds default timeout for GAS cold starts

    console.groupCollapsed(`🌐 [API Request] ${action} (${companyId})`);
    console.log(`Payload:`, payload);
    console.log(`Target URL:`, GAS_URL);

    if (!GAS_URL) {
      const errorMsg = "Google Apps Script Web App URL is not configured.";
      console.error(`❌ [API Error] ${action}: ${errorMsg}`);
      console.groupEnd();
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
      response = await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ action, payload }),
        signal: controller.signal,
        redirect: "follow", // Follow 302/301 redirects transparently
      });

      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      console.log(`HTTP Status: ${response.status} ${response.statusText} (took ${durationMs}ms)`);

      rawText = await response.text();

      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseError: any) {
        console.error(`❌ [JSON Parse Error] ${action} (Status: ${response.status}, took ${durationMs}ms):`, parseError);
        console.warn(`Raw Response Body preview:`, rawText ? rawText.substring(0, 300) : '<empty>');
        console.groupEnd();

        return {
          success: false,
          data: null as any,
          message: `فشل معالجة استجابة الخادم لطلب (${action}).`,
          error: {
            code: "JSON_PARSE_ERROR",
            details: `HTTP ${response.status}: Failed to parse JSON response. Response starts with: ${rawText ? rawText.substring(0, 100) : 'empty'}`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      console.log(`Parsed Result:`, parsedJson);
      console.groupEnd();

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

      return parsedJson as ApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      const isAbort = error.name === "AbortError";
      const errorCode = isAbort ? "TIMEOUT_ERROR" : "NETWORK_ERROR";
      const errorMessage = isAbort
        ? `انتهت مهلة انتظار استجابة الخادم (${Math.round(timeoutMs / 1000)} ثانية) لطلب ${action}.`
        : error.message || "تعذر الاتصال بالخادم.";

      console.error(`❌ [API Request Failed] ${action} (Duration: ${durationMs}ms, Code: ${errorCode}):`, error);
      console.groupEnd();

      return {
        success: false,
        data: null as any,
        message: errorMessage,
        error: {
          code: errorCode,
          details: String(error.message || error),
        },
        timestamp: new Date().toISOString(),
      };
    }
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

