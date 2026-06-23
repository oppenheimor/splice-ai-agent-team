export const APP_BASE_PATH = "/agent-team";

export function buildBrowserPath(appPath: string) {
  const normalizedPath = normalizeAppPath(appPath);
  return normalizedPath === "/" ? APP_BASE_PATH : `${APP_BASE_PATH}${normalizedPath}`;
}

export function buildCreditsHref(returnTo?: string) {
  const safeReturnTo = normalizeSafeAppReturnPath(returnTo);
  if (!safeReturnTo) return "/credits";

  return `/credits?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function getAppPathFromBrowserLocation(location: Location) {
  const pathname = stripBasePath(location.pathname);
  return `${pathname}${location.search}`;
}

export function normalizeSafeAppReturnPath(value?: string | null) {
  if (!value) return null;

  try {
    const decodedValue = decodeURIComponent(value);
    // returnTo 只能是站内路径，避免把返回按钮变成开放跳转入口。
    if (!decodedValue.startsWith("/") || decodedValue.startsWith("//")) return null;
    if (decodedValue.includes("\n") || decodedValue.includes("\r")) return null;

    const appPath = stripBasePath(decodedValue);
    if (appPath === "/credits" || appPath.startsWith("/credits?")) return null;

    return appPath;
  } catch {
    return null;
  }
}

function stripBasePath(path: string) {
  if (path === APP_BASE_PATH) return "/";
  if (path.startsWith(`${APP_BASE_PATH}/`)) return path.slice(APP_BASE_PATH.length);
  return path;
}

function normalizeAppPath(path: string) {
  if (!path.startsWith("/")) return `/${path}`;
  return stripBasePath(path);
}
