import { auth } from "@clerk/nextjs/server";
import { NewInterviewForm } from "@/components/interview/NewInterviewForm";

export default async function NewInterviewPage() {
  await auth.protect();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">New interview</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Set the role, topic, and skills to seed the AI interviewer.
        </p>
      </div>
      <NewInterviewForm />
    </main>
  );
}
