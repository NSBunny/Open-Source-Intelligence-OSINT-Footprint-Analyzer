import type { ScanRequest, ScanResult } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  async startScan(data: ScanRequest): Promise<{ scanId: string }> {
    const res = await fetch(`${this.baseUrl}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: data.email || data.username || "",
        depth: "standard",
      }),
    });
    if (!res.ok) throw new Error("Failed to start scan");
    return res.json();
  }

  async getScanResult(scanId: string): Promise<ScanResult> {
    const res = await fetch(`${this.baseUrl}/api/scan/${scanId}`);
    if (!res.ok) throw new Error("Failed to get scan result");
    return res.json();
  }

  subscribeScanProgress(scanId: string, onProgress: (data: ScanResult) => void): EventSource {
    const es = new EventSource(`${this.baseUrl}/api/scan/${scanId}/progress`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onProgress(data);
    };
    es.onerror = () => {
      es.close();
    };
    return es;
  }

  async exportPdf(scanId: string): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/api/scan/${scanId}/export`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to export PDF");
    return res.blob();
  }
}

export const api = new ApiService();
