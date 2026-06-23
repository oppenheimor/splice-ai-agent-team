"use client";

import { useCallback, useEffect, useState } from "react";

export type CreditBalance = {
  balance: number;
  totalGranted: number;
  totalConsumed: number;
  updatedAt: string;
};

export type UseCreditBalanceResult = {
  balance: CreditBalance | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useCreditBalance(): UseCreditBalanceResult {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/agent-team/api/credits/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const payload = await response.json() as CreditBalance;
      setBalance(payload);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "积分余额读取失败。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    function handleCreditsChanged() {
      void refresh();
    }

    window.addEventListener("credits:changed", handleCreditsChanged);
    return () => window.removeEventListener("credits:changed", handleCreditsChanged);
  }, [refresh]);

  return {
    balance,
    isLoading,
    error,
    refresh,
  };
}

async function readApiError(response: Response): Promise<string> {
  try {
    const payload = await response.clone().json() as { error?: unknown };
    if (typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // 非 JSON 错误体会回退到纯文本，避免把解析异常暴露给用户。
  }

  const text = await response.text().catch(() => "");
  return text.trim() || `请求失败：${response.status}`;
}
