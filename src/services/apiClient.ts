import { ApiResponse } from "@/types/responses";

// Try to get URL from import.meta.env, fallback to the known URL if missing during dev
const GAS_URL =
  (typeof process !== 'undefined' ? process.env.VITE_GAS_WEBAPP_URL : ((import.meta as any).env && (import.meta as any).env.VITE_GAS_WEBAPP_URL)) ||
  "https://script.google.com/macros/s/AKfycbzEsIMtuEO333KPSe607kKJ7OuHjzuJ42-0vKvTOJQOHKUGkFI3fAomDx7_PY-y1WVp/exec";

export class ApiClient {
  private static async request<T>(
    action: string,
    payload: any = {},
  ): Promise<ApiResponse<T>> {
    try {
      // Logging as requested by the user
      console.log({
        action,
        companyId: payload?.CompanyID || payload?.companyId || "COM-0001",
        payload,
      });

      if (!GAS_URL) {
        throw new Error("Google Apps Script Web App URL is not configured.");
      }

      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result as ApiResponse<T>;
    } catch (error: any) {
      console.warn(`API Request Failed (${action}):`, error);
      return {
        success: false,
        data: null as any,
        message: error.message || "Network error.",
        error: {
          code: "NETWORK_ERROR",
          details: String(error),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async get<T>(
    action: string,
    params: any = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(action, params);
  }

  static async post<T>(
    action: string,
    data: any = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(action, data);
  }
}
