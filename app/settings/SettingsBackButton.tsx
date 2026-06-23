"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DUPLICATED_BASE_PATH_PREFIX = "/agent-team/agent-team";

export function SettingsBackButton() {
  const router = useRouter();

  function handleBack() {
    const previousPathname = getPreviousHistoryPathname();

    if (previousPathname?.startsWith(DUPLICATED_BASE_PATH_PREFIX)) {
      router.push("/");
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="-ml-2 h-9 rounded-full px-2 text-[#525252] shadow-none hover:bg-transparent hover:text-[#171717]"
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
      返回
    </Button>
  );
}

function getPreviousHistoryPathname() {
  if (!("navigation" in window)) {
    return null;
  }

  const navigationApi = window.navigation;
  const currentEntry = navigationApi.currentEntry;

  if (!currentEntry || currentEntry.index <= 0) {
    return null;
  }

  // 只拦截历史栈里的已知坏路径；正常来源仍交给浏览器返回上一页。
  const previousUrl = navigationApi.entries()[currentEntry.index - 1]?.url;

  if (!previousUrl) {
    return null;
  }

  try {
    return new URL(previousUrl).pathname;
  } catch {
    return null;
  }
}
