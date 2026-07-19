import type { WISH_CAPABILITY_GAPS } from "@/constants/wish-intake";

export type WishCapabilityGapId = (typeof WISH_CAPABILITY_GAPS)[number]["id"];

export type WishSummary = {
  title: string;
  goal: string;
  usageScenario: string;
  currentProblem: string;
  idealResult: string;
  constraints: string;
};

export type WishAnalysis = {
  capabilityGaps: WishCapabilityGapId[];
  rationale: string;
  version: string;
};

export type WishRecord = WishSummary & {
  id: string;
  conversationId: string;
  capabilityGaps: WishCapabilityGapId[];
  contactClickCount: number;
  submittedAt: string;
};

type WishListItemBase = {
  conversationId: string;
  title: string;
  preview: string;
  activityAt: string;
};

export type WishListItem =
  | WishListItemBase & {
    status: "draft";
  }
  | WishListItemBase & {
    status: "submitted";
    wishId: string;
  };
