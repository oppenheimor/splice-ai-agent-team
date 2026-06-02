import { notFound } from "next/navigation";
import { DiagnosisDemoWall } from "./DiagnosisDemoWall";
import { demoStyles, type DiagnosisDemoStyleId } from "./demo-data";

type DemoRouteProps = {
  styleId: DiagnosisDemoStyleId;
  demoPath?: string[];
};

export function RequirementsDiagnosisDemoRoute({ styleId, demoPath = [] }: DemoRouteProps) {
  const page = resolveDemoPage(demoPath);
  if (!page) notFound();

  return <DiagnosisDemoWall style={demoStyles[styleId]} page={page} />;
}

export function generateDemoStaticParams() {
  return [
    {},
    { demoPath: ["quiz"] },
    { demoPath: ["result"] },
    { demoPath: ["history"] },
    { demoPath: ["chat", "demo-record-1"] },
  ];
}

function resolveDemoPage(demoPath: string[]): "home" | "quiz" | "result" | "history" | "chat" | null {
  if (demoPath.length === 0) return "home";
  if (demoPath.length === 1 && demoPath[0] === "quiz") return "quiz";
  if (demoPath.length === 1 && demoPath[0] === "result") return "result";
  if (demoPath.length === 1 && demoPath[0] === "history") return "history";
  if (demoPath.length === 2 && demoPath[0] === "chat") return "chat";
  return null;
}
