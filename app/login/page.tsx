import { redirect } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { getAccountAuthMode } from "@/utils/auth-routing";
import { normalizeSafeAppReturnPath } from "@/utils/routing";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeSafeAppReturnPath(params?.redirect_url) ?? "";
  const mode = getAccountAuthMode(params?.mode);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath || "/");
  }

  const error = params?.error;

  return (
    <main
      className={`${GeistSans.variable} relative min-h-screen overflow-hidden bg-[#fafafa] px-5 text-[#171717] [font-family:var(--font-geist-sans),'Noto_Sans_SC','Source_Han_Sans_SC',ui-sans-serif,sans-serif]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.026)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.026)_1px,transparent_1px)] bg-size-[36px_36px] mask-[linear-gradient(to_bottom,transparent,black_18%,black_70%,transparent)] lg:bg-size-[44px_44px] lg:mask-[radial-gradient(ellipse_at_center,black_0%,black_48%,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(to_bottom,#fff_0%,rgba(255,255,255,0.94)_45%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(to_top,#fff_0%,rgba(255,255,255,0.86)_30%,transparent_100%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl items-start justify-center pt-[19vh] lg:items-center lg:pt-0">
        <div className="grid w-full min-w-0 items-center justify-items-center lg:min-h-[360px] lg:grid-cols-[1fr_1px_372px] lg:gap-14 lg:border-y lg:border-[#eaeaea] lg:bg-white/72 lg:px-12 lg:py-16 lg:shadow-[0_1px_0_rgba(255,255,255,0.92)_inset] lg:backdrop-blur-[1px]">
          <div className="hidden w-full items-center lg:flex">
            <h1 className="max-w-[360px] text-[38px] font-semibold leading-[1.16] text-[#171717]">
              欢迎来到 Splice AI
            </h1>
          </div>
          <div className="hidden h-48 w-px bg-[#ebebeb] lg:block" />

          <LoginPanel
            error={error}
            mode={mode}
            redirectUrl={nextPath}
            searchParams={params}
          />
        </div>
      </section>
    </main>
  );
}
