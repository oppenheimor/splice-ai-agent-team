import { redirect } from "next/navigation";

type DiagnosisChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DiagnosisChatPage({ params }: DiagnosisChatPageProps) {
  const { id } = await params;

  redirect(`/deep-diagnosis/chat/${id}?sourceResultId=${id}`);
}
