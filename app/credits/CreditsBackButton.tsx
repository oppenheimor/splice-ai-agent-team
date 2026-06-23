"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeSafeAppReturnPath } from "@/utils/routing";

export function CreditsBackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleBack() {
    const returnTo = normalizeSafeAppReturnPath(searchParams.get("returnTo"));
    if (returnTo) {
      router.replace(returnTo);
      return;
    }

    router.replace("/");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="-ml-3 mb-3 rounded-full hover:bg-transparent hover:text-[#171717]"
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
      返回
    </Button>
  );
}
