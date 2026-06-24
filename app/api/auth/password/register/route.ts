import { NextRequest } from "next/server";
import { ACCOUNT_AUTH_MODES } from "@/constants/auth";
import { AUTH_LOGIN_ERROR_CODES } from "@/constants/auth-errors";
import { registerWithPassword } from "@/app/api/auth/password/service";
import {
  getAuthRequestClientInfo,
  redirectToAuthError,
  redirectWithAuthSession,
} from "../../shared";
import { readPasswordAuthForm } from "../shared";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const { username, password, confirmPassword, nextPath } = readPasswordAuthForm(formData);

  if (!username || !password) {
    return redirectToAuthError(
      request,
      AUTH_LOGIN_ERROR_CODES.missingCredentials,
      nextPath,
      ACCOUNT_AUTH_MODES.register,
    );
  }

  if (password !== confirmPassword) {
    return redirectToAuthError(
      request,
      AUTH_LOGIN_ERROR_CODES.passwordMismatch,
      nextPath,
      ACCOUNT_AUTH_MODES.register,
    );
  }

  try {
    const session = await registerWithPassword({
      username,
      password,
      ...getAuthRequestClientInfo(request),
    });

    return redirectWithAuthSession(request, session, nextPath);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_USERNAME") {
      return redirectToAuthError(
        request,
        AUTH_LOGIN_ERROR_CODES.invalidUsername,
        nextPath,
        ACCOUNT_AUTH_MODES.register,
      );
    }

    if (error instanceof Error && error.message === "INVALID_PASSWORD") {
      return redirectToAuthError(
        request,
        AUTH_LOGIN_ERROR_CODES.invalidPassword,
        nextPath,
        ACCOUNT_AUTH_MODES.register,
      );
    }

    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      return redirectToAuthError(
        request,
        AUTH_LOGIN_ERROR_CODES.usernameTaken,
        nextPath,
        ACCOUNT_AUTH_MODES.register,
      );
    }

    throw error;
  }
}
