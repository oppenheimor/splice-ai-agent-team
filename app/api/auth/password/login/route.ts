import { NextRequest } from "next/server";
import { AUTH_LOGIN_ERROR_CODES } from "@/constants/auth-errors";
import { loginWithPassword } from "@/app/api/auth/password/service";
import {
  getAuthRequestClientInfo,
  redirectToAuthError,
  redirectWithAuthSession,
} from "../../shared";
import { readPasswordAuthForm } from "../shared";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const { username, password, nextPath } = readPasswordAuthForm(formData);

  if (!username || !password) {
    return redirectToAuthError(
      request,
      AUTH_LOGIN_ERROR_CODES.missingCredentials,
      nextPath,
    );
  }

  try {
    const session = await loginWithPassword({
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
      );
    }

    if (error instanceof Error && error.message === "INVALID_PASSWORD") {
      return redirectToAuthError(
        request,
        AUTH_LOGIN_ERROR_CODES.invalidPassword,
        nextPath,
      );
    }

    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return redirectToAuthError(
        request,
        AUTH_LOGIN_ERROR_CODES.invalidCredentials,
        nextPath,
      );
    }

    throw error;
  }
}
