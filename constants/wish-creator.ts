export const WISH_CREATOR_AGENT_ID = "wish-creator";
export const WISH_CREATOR_CONVERSATION_HEADER = "x-wish-creator-conversation-id";
export const WISH_CREATOR_DEFAULT_TITLE = "新的愿望";
export const WISH_CREATOR_SPLIT_STORAGE_KEY = "wish-creator.desktop-split.v1";
export const WISH_CREATOR_SIDEBAR_STORAGE_KEY = "wish-creator.sidebar-collapsed.v1";

export const WISH_CREATOR_STARTERS = [
  {
    title: "贪吃蛇小游戏",
    description: "经典玩法，支持方向控制与得分记录。",
    prompt: "生成一个有开始、暂停和重新开始功能的贪吃蛇小游戏，使用清爽的霓虹风格。",
  },
  {
    title: "卡比风今日吃什么",
    description: "可爱卡片风，随机推荐每日餐食灵感。",
    prompt: "生成一个卡比风格的“今日吃什么”随机选择页面，整体粉色可爱，但不要使用受版权保护的角色图片。",
  },
  {
    title: "给朋友的生日贺卡",
    description: "写下专属祝福，送出一张有惊喜的贺卡。",
    prompt: "制作一张送给朋友的生日贺卡页面，包含温暖的祝福、蛋糕和彩带动画，点击后可以打开贺卡。",
  },
] as const;

export const WISH_CREATOR_PENDING_PROMPT_PREFIX = "wish-creator.pending-prompt.";
export const WISH_CREATOR_REQUIREMENT_GATE_PREFIX = "wish-creator.requirement-gate.";
export const WISH_CREATOR_BLOCKED_ARTIFACTS_PREFIX = "wish-creator.blocked-artifacts.";
export const WISH_CREATOR_START_IMPLEMENTATION_OPTION_ID = "wish-creator-start-implementation";
