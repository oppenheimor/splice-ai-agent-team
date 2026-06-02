import { requireUser } from "@/lib/auth/session";
import { quizQuestions } from "@/lib/requirements-diagnosis/quiz";
import { RequirementsQuizClient } from "./page-client";

export default async function RequirementsQuizPage() {
  await requireUser();

  return <RequirementsQuizClient questions={quizQuestions} />;
}
