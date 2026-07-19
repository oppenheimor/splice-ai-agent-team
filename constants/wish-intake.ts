export const WISH_INTAKE_AGENT_ID = "wish-intake";
export const WISH_ANALYSIS_VERSION = "wish-capability-gaps-v1";
export const WISH_ADMIN_USERNAMES_ENV = "WISH_ADMIN_USERNAMES";

export const WISH_CAPABILITY_GAPS = [
  { id: "backend_database", label: "后端与数据库" },
  { id: "auth_collaboration", label: "账号、权限与多人协作" },
  { id: "external_integration", label: "外部 API 与业务系统接入" },
  { id: "media_files", label: "图片、文件与多媒体处理" },
  { id: "complex_application", label: "多页面与复杂应用" },
  { id: "automation_runtime", label: "自动化任务与持续运行" },
  { id: "generation_editing", label: "生成质量与修改能力" },
  { id: "other", label: "其他能力缺口" },
] as const;

export const WISH_CAPABILITY_GAP_IDS = [
  "backend_database",
  "auth_collaboration",
  "external_integration",
  "media_files",
  "complex_application",
  "automation_runtime",
  "generation_editing",
  "other",
] as const;
