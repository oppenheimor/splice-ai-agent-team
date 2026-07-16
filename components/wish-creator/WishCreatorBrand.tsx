import Image from "next/image";
import { cn } from "@/lib/utils";

export function WishCreatorBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-0" : "gap-2.5")}>
      <Image
        alt="许愿池"
        className="h-10 w-10 rounded-lg object-cover"
        height={40}
        priority
        src="/agent-team/wish-creator/wish-creator-logo.png"
        width={40}
      />
      {!compact ? <span className="text-[22px] font-bold tracking-tight text-white">许愿池</span> : null}
    </div>
  );
}
