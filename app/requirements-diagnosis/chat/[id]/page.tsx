import { redirect } from "next/navigation";

type DiagnosisChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DiagnosisChatPage({ params }: DiagnosisChatPageProps) {
  await params;
  redirect("/deep-diagnosis");
}
