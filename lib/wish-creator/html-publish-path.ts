export const MAX_HTML_PUBLISH_PATH_LENGTH = 180;

export function normalizeHtmlPublishPath(filePath: string): string | undefined {
  const artifactPath = filePath.startsWith("/workspace/")
    ? filePath.slice("/workspace/".length)
    : filePath;

  if (
    artifactPath.length > MAX_HTML_PUBLISH_PATH_LENGTH ||
    !/^lab\/[A-Za-z0-9._/-]+\.html$/iu.test(artifactPath) ||
    artifactPath.split("/").slice(1).some((segment) => ["", ".", ".."].includes(segment))
  ) {
    return undefined;
  }

  return artifactPath;
}
