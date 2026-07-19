import assert from "node:assert/strict";
import test from "node:test";
import { toWishListItem } from "./list-items.ts";

const conversation = {
  conversationId: "wish-conversation-1",
  title: "企业报销工具",
  firstUserText: "我想做一个企业报销工具",
  lastMessageAt: new Date("2026-07-20T08:00:00.000Z"),
};

test("有过真实对话但尚未提交时生成草稿项", () => {
  assert.deepEqual(toWishListItem({ ...conversation, wishCreatorWish: null }), {
    status: "draft",
    conversationId: "wish-conversation-1",
    title: "企业报销工具",
    preview: "我想做一个企业报销工具",
    activityAt: "2026-07-20T08:00:00.000Z",
  });
});

test("提交后同一条对话只生成已提交项", () => {
  assert.deepEqual(toWishListItem({
    ...conversation,
    wishCreatorWish: {
      id: "wish-1",
      title: "企业报销工具",
      goal: "统一收集和审批报销单",
      submittedAt: new Date("2026-07-20T09:00:00.000Z"),
      userRemovedAt: null,
    },
  }), {
    status: "submitted",
    wishId: "wish-1",
    conversationId: "wish-conversation-1",
    title: "企业报销工具",
    preview: "统一收集和审批报销单",
    activityAt: "2026-07-20T09:00:00.000Z",
  });
});

test("未开始对话或已从列表移除时不生成列表项", () => {
  assert.equal(toWishListItem({
    ...conversation,
    firstUserText: null,
    wishCreatorWish: null,
  }), null);

  assert.equal(toWishListItem({
    ...conversation,
    wishCreatorWish: {
      id: "wish-1",
      title: "企业报销工具",
      goal: "统一收集和审批报销单",
      submittedAt: new Date("2026-07-20T09:00:00.000Z"),
      userRemovedAt: new Date("2026-07-20T10:00:00.000Z"),
    },
  }), null);
});
