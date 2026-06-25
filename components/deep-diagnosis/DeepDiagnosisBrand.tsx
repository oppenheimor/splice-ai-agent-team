import Image from "next/image";
import { cn } from "@/lib/utils";

const DEEP_DIAGNOSIS_LOGO_SRC = "/agent-team/brand/deep-diagnosis/logo.jpg";
const DEEP_DIAGNOSIS_INPUT_MASCOT_SRC = "/agent-team/brand/deep-diagnosis/input-mascot.png";

export function DeepDiagnosisLogo({
  className,
  imageClassName,
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full", className)}>
      <Image
        src={DEEP_DIAGNOSIS_LOGO_SRC}
        alt="Deep Diagnosis Logo"
        width={1024}
        height={1024}
        unoptimized
        className={cn("block h-full w-full object-cover", imageClassName)}
        draggable={false}
      />
    </span>
  );
}

export function DeepDiagnosisInputMascot({ className }: { className?: string }) {
  return (
    <Image
      src={DEEP_DIAGNOSIS_INPUT_MASCOT_SRC}
      alt=""
      aria-hidden="true"
      width={1024}
      height={1024}
      unoptimized
      className={cn("pointer-events-none select-none object-contain", className)}
      draggable={false}
    />
  );
}
