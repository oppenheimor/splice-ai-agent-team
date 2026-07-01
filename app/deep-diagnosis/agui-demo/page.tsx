import type { Metadata } from "next";
import { DeepDiagnosisAguiDemoWall } from "@/components/deep-diagnosis/demo/DeepDiagnosisAguiDemoWall";

// TODO: 这是临时样板墙路由，AGUI 样式确认后可删除整个 app/deep-diagnosis/agui-demo 目录。
export const metadata: Metadata = {
  title: "deep-diagnosis AGUI 样板墙",
  description: "临时查看 deep-diagnosis AGUI 组件样式的 Mock 数据页面。",
};

export default function DeepDiagnosisAguiDemoPage() {
  return <DeepDiagnosisAguiDemoWall />;
}
