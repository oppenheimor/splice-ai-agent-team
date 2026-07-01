import { normalizeSafeAppReturnPath } from "@/utils/routing";

export type PasswordAuthForm = {
  username: string;
  password: string;
  confirmPassword: string;
  nextPath: string;
};

/**
 * 读取表单数据
 * @param formData 表单数据
 * @returns 表单数据，用户名，密码，确认密码，重定向路径
 */
export function readPasswordAuthForm(formData: FormData): PasswordAuthForm {
  return {
    username: String(formData.get("username") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirm_password") ?? ""),
    nextPath: normalizeSafeAppReturnPath(
      String(formData.get("redirect_url") ?? ""),
    ) ?? "",
  };
}
