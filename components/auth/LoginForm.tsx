"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SMS_CODE_RESEND_COOLDOWN_SECONDS } from "@/constants/auth";
import { appendCsrfToken } from "@/lib/security/csrf-client";
import { CSRF_FORM_FIELD_NAME } from "@/lib/security/csrf-constants";
import { isValidPhone, normalizePhone } from "@/utils/phone";

type LoginMode = "password" | "sms";

type LoginFormProps = {
  nextPath: string;
  csrfToken: string;
  error?: string;
  initialMode?: LoginMode;
  initialPhone?: string;
};

const inputClassName =
  "h-10 rounded-[6px] border-[#d8d8d8] bg-white px-3 text-[13px] text-[#171717] shadow-[0_1px_0_rgba(0,0,0,0.02)] placeholder:text-[#8f8f8f] hover:border-[#bdbdbd] focus-visible:border-[#171717] focus-visible:ring-[#006bff] focus-visible:ring-offset-2 lg:h-11 lg:px-3.5 lg:text-[14px]";
const smsResendStoragePrefix = "agent-team.sms-resend-ready-at";
const lastSmsPhoneStorageKey = "agent-team.sms-last-phone";

export function LoginForm({ nextPath, csrfToken, error, initialMode, initialPhone }: LoginFormProps) {
  const [mode, setMode] = useState<LoginMode>(initialMode ?? "sms");
  const [phone, setPhone] = useState<string>(initialPhone ?? "");
  const [sendCodeState, setSendCodeState] = useState<{
    status: "idle" | "sending" | "sent" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const [resendCountdown, setResendCountdown] = useState(0);

  const visibleError = useMemo(() => getErrorMessage(error), [error]);
  const canSendCode = isValidPhone(phone) && sendCodeState.status !== "sending" && resendCountdown === 0;
  const sendCodeButtonText = resendCountdown > 0 ? `${resendCountdown}s` : "发送";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedState = getInitialSmsState(initialPhone);
      setPhone(storedState.phone);
      setResendCountdown(storedState.resendCountdown);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialPhone]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  async function handleSendCode() {
    if (!canSendCode) return;

    setSendCodeState({ status: "sending", message: "正在发送..." });

    const formData = new FormData();
    formData.set("phone", phone);

    const response = await fetch("/agent-team/api/auth/send-code", {
      method: "POST",
      body: appendCsrfToken(formData),
    });

    if (response.ok) {
      setSendCodeState({ status: "sent", message: "验证码已发送，请查看短信。" });
      setResendCountdown(SMS_CODE_RESEND_COOLDOWN_SECONDS);
      storeResendReadyAt(phone);
      storeLastSmsPhone(phone);
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setSendCodeState({
      status: "error",
      message: getSendCodeErrorMessage(payload.error),
    });
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    setResendCountdown(getStoredResendCountdown(value));
  }

  return (
    <div className="w-[min(348px,calc(100vw-40px))] max-w-full space-y-4 lg:w-full lg:space-y-5">
      <div className="flex border-b border-[#eaeaea]">
        <button
          type="button"
          onClick={() => setMode("sms")}
          className={getTabClassName(mode === "sms")}
        >
          手机验证码
        </button>
        <button
          type="button"
          onClick={() => setMode("password")}
          className={getTabClassName(mode === "password")}
        >
          账号密码
        </button>
      </div>

      {mode === "sms" ? (
        <form key="sms-login-form" className="space-y-4" action="/agent-team/api/auth/login-sms" method="post">
          <input type="hidden" name="redirect_url" value={nextPath} />
          <input type="hidden" name={CSRF_FORM_FIELD_NAME} value={csrfToken} />

          <div className="space-y-3">
            <div>
              <Label className="sr-only" htmlFor="sms-phone">
                手机号
              </Label>
              <Input
                id="sms-phone"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder="手机号"
                required
                value={phone ?? ""}
                onChange={(event) => handlePhoneChange(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-[1fr_108px] gap-2">
              <div>
                <Label className="sr-only" htmlFor="sms-code">
                  验证码
                </Label>
                <Input
                  id="sms-code"
                  name="code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="验证码"
                  required
                  className={inputClassName}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={!canSendCode}
                className="h-10 rounded-[6px] border-[#d8d8d8] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#f7f7f7] lg:h-11"
              >
                <MessageCircleMore className="h-4 w-4" />
                <span className="min-w-[30px]">{sendCodeButtonText}</span>
              </Button>
            </div>
          </div>

          <div className="min-h-5">
            {sendCodeState.message ? (
              <p
                className={
                  sendCodeState.status === "error"
                    ? "text-sm leading-5 text-destructive"
                    : "text-sm leading-5 text-[#4b5563]"
                }
              >
                {sendCodeState.message}
              </p>
            ) : null}
          </div>

          {visibleError ? <p className="text-sm leading-5 text-destructive">{visibleError}</p> : null}

          <Button
            type="submit"
            className="h-10 w-full rounded-[6px] bg-[#171717] text-[13px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(0,0,0,0.12)] hover:bg-black lg:h-11 lg:text-[14px]"
          >
            登录/注册
          </Button>
        </form>
      ) : (
        <form key="password-login-form" className="space-y-4" action="/agent-team/api/auth/login" method="post">
          <input type="hidden" name="redirect_url" value={nextPath} />
          <input type="hidden" name={CSRF_FORM_FIELD_NAME} value={csrfToken} />

          <div className="space-y-3">
            <div>
              <Label className="sr-only" htmlFor="username">
                用户名
              </Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="用户名"
                required
                className={inputClassName}
              />
            </div>

            <div>
              <Label className="sr-only" htmlFor="password">
                密码
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="密码"
                required
                className={inputClassName}
              />
            </div>
          </div>

          {visibleError ? <p className="text-sm leading-5 text-destructive">{visibleError}</p> : null}

          <Button
            type="submit"
            className="h-10 w-full rounded-[6px] bg-[#171717] text-[13px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_1px_2px_rgba(0,0,0,0.12)] hover:bg-black lg:h-11 lg:text-[14px]"
          >
            登录/注册
          </Button>
        </form>
      )}
    </div>
  );
}

function getResendStorageKey(phone: string): string {
  return `${smsResendStoragePrefix}:${normalizePhone(phone)}`;
}

function getInitialSmsState(initialPhone: string | undefined): {
  phone: string;
  resendCountdown: number;
} {
  const phone = initialPhone ?? getStoredLastSmsPhone();
  return {
    phone,
    resendCountdown: getStoredResendCountdown(phone),
  };
}

function getStoredLastSmsPhone(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(lastSmsPhoneStorageKey) ?? "";
}

function getStoredResendCountdown(phone: string): number {
  if (!isValidPhone(phone)) return 0;
  if (typeof window === "undefined") return 0;

  const readyAt = Number(window.localStorage.getItem(getResendStorageKey(phone)));

  if (!Number.isFinite(readyAt)) return 0;

  return Math.max(Math.ceil((readyAt - Date.now()) / 1000), 0);
}

function storeResendReadyAt(phone: string): void {
  if (!isValidPhone(phone)) return;

  window.localStorage.setItem(
    getResendStorageKey(phone),
    String(Date.now() + SMS_CODE_RESEND_COOLDOWN_SECONDS * 1000),
  );
}

function storeLastSmsPhone(phone: string): void {
  if (!isValidPhone(phone)) return;
  window.localStorage.setItem(lastSmsPhoneStorageKey, normalizePhone(phone));
}

function getTabClassName(isActive: boolean): string {
  return [
    "-mb-px pb-2.5 pr-5 text-left text-[14px] font-medium leading-6 transition-colors",
    isActive
      ? "border-b border-[#171717] text-[#171717]"
      : "border-b border-transparent text-[#737373] hover:text-[#171717]",
  ].join(" ");
}

function getSendCodeErrorMessage(error?: string): string {
  const messages: Record<string, string> = {
    invalid_phone: "请输入有效手机号。",
    too_many_requests: "发送太频繁，请稍后再试。",
  };

  return messages[error ?? ""] ?? "验证码发送失败，请稍后再试。";
}

function getErrorMessage(error?: string): string {
  const messages: Record<string, string> = {
    missing_credentials: "请输入用户名和密码。",
    invalid_username: "用户名需为 3-32 位小写字母、数字、下划线或短横线，并以字母或数字开头。",
    invalid_password: "密码长度需为 6-128 位。",
    invalid_credentials: "密码不正确。这个用户名已经注册过了。",
    invalid_phone: "请输入有效手机号。",
    invalid_code: "验证码不正确。",
    code_expired: "验证码已过期，请重新获取。",
    too_many_code_attempts: "验证码错误次数过多，请重新获取。",
    csrf_token_invalid: "页面安全令牌已失效，请刷新后重试。",
  };

  return messages[error ?? ""] ?? "";
}
