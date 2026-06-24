import Link from "next/link";
import { ACCOUNT_AUTH_MODES, type AccountAuthMode } from "@/constants/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthLoginErrorMessage } from "@/utils/auth-errors";
import { buildAccountModeSwitchHref } from "@/utils/auth-routing";

type AccountPasswordFormProps = {
  error?: string;
  mode: AccountAuthMode;
  redirectUrl: string;
  searchParams?: Record<string, string | undefined>;
};

const inputClassName =
  "h-10 rounded-[6px] border-[#d8d8d8] bg-white px-3 text-[13px] text-[#171717] shadow-[0_1px_0_rgba(0,0,0,0.02)] placeholder:text-[#8f8f8f] hover:border-[#bdbdbd] focus-visible:border-[#171717] focus-visible:ring-[#006bff] focus-visible:ring-offset-2 lg:h-11 lg:px-3.5 lg:text-[14px]";
const fieldHintClassName = "mt-1.5 text-[12px] leading-5 text-[#737373]";
const visibleLabelClassName = "mb-1.5 flex items-center gap-1 text-[13px] font-medium leading-5 text-[#171717]";

const accountPasswordFormActions = {
  login: "/agent-team/api/auth/password/login",
  register: "/agent-team/api/auth/password/register",
} as const;

export function AccountPasswordForm({
  error,
  mode,
  redirectUrl,
  searchParams,
}: AccountPasswordFormProps) {
  const isRegisterMode = mode === ACCOUNT_AUTH_MODES.register;
  const formAction = isRegisterMode
    ? accountPasswordFormActions.register
    : accountPasswordFormActions.login;
  const modeSwitchHref = buildAccountModeSwitchHref({
    mode: isRegisterMode ? ACCOUNT_AUTH_MODES.login : ACCOUNT_AUTH_MODES.register,
    searchParams,
  });

  return (
    <form
      className="w-[min(348px,calc(100vw-40px))] max-w-full space-y-4 lg:w-full lg:space-y-5"
      action={formAction}
      method="post"
    >
      {/* 表单提交时保留登录前访问的页面，认证成功后回到原页面。 */}
      <input type="hidden" name="redirect_url" value={redirectUrl} />

      <div className="flex border-b border-[#eaeaea]">
        <div className="-mb-px border-b border-[#171717] pb-2.5 text-[14px] font-medium leading-6 text-[#171717]">
          {isRegisterMode ? "账号注册" : "账号登录"}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className={isRegisterMode ? visibleLabelClassName : "sr-only"} htmlFor="username">
            {isRegisterMode ? <span className="text-destructive">*</span> : null}
            用户名
          </Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="用户名"
            required
            pattern="[A-Za-z0-9][A-Za-z0-9_]{2,31}"
            minLength={3}
            maxLength={32}
            className={inputClassName}
          />
          {isRegisterMode ? (
            <p className={fieldHintClassName}>
              支持字母、数字及下划线
            </p>
          ) : null}
        </div>

        <div>
          <Label className={isRegisterMode ? visibleLabelClassName : "sr-only"} htmlFor="password">
            {isRegisterMode ? <span className="text-destructive">*</span> : null}
            密码
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegisterMode ? "new-password" : "current-password"}
            placeholder="密码"
            required
            pattern="[A-Za-z0-9_]{6,128}"
            minLength={6}
            maxLength={128}
            className={inputClassName}
          />
          {isRegisterMode ? (
            <p className={fieldHintClassName}>密码长度至少 6 位，仅支持字母、数字及下划线</p>
          ) : null}
        </div>

        {isRegisterMode ? (
          <div>
            <Label className={visibleLabelClassName} htmlFor="confirm-password">
              <span className="text-destructive">*</span>
              确认密码
            </Label>
            <Input
              id="confirm-password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              placeholder="确认密码"
              required
              pattern="[A-Za-z0-9_]{6,128}"
              minLength={6}
              maxLength={128}
              className={inputClassName}
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm leading-5 text-destructive">
          {getAuthLoginErrorMessage(error)}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-10 w-full rounded-[6px] bg-[#171717] text-[13px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(0,0,0,0.12)] hover:bg-black lg:h-11 lg:text-[14px]"
      >
        {isRegisterMode ? "注册并登录" : "登录"}
      </Button>

      <p className="flex justify-center gap-1 text-center text-[13px] leading-5 text-[#737373]">
        {isRegisterMode ? "已有账号？" : "没有账号？"}
        <Link
          className="font-medium text-[#171717] underline underline-offset-4 hover:text-black"
          href={modeSwitchHref}
        >
          {isRegisterMode ? "登录" : "注册"}
        </Link>
      </p>
    </form>
  );
}
