import { AccountPasswordForm } from "@/components/auth/AccountPasswordForm";
import type { AccountAuthMode } from "@/constants/auth";

type LoginPanelProps = {
  error?: string;
  mode: AccountAuthMode;
  redirectUrl: string;
  searchParams?: Record<string, string | undefined>;
};

export function LoginPanel(props: LoginPanelProps) {
  return <AccountPasswordForm {...props} />;
}
