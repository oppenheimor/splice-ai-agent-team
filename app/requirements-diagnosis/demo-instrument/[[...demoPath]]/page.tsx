import { generateDemoStaticParams, RequirementsDiagnosisDemoRoute } from "@/components/requirements-diagnosis/demo/demo-route";

type PageProps = {
  params: Promise<{
    demoPath?: string[];
  }>;
};

export const generateStaticParams = generateDemoStaticParams;

export default async function InstrumentDemoPage({ params }: PageProps) {
  const { demoPath } = await params;
  return <RequirementsDiagnosisDemoRoute styleId="demo-instrument" demoPath={demoPath} />;
}
