"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function NewInterviewForm() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const [skills, setSkills] = useState("");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams({ role, topic, skills });
    router.push(`/interview/session?${params.toString()}`);
  };

  const inputClass =
    "h-10 w-full rounded-md border border-black/[.12] px-3 text-sm outline-none dark:border-white/[.15]";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Role</span>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Backend Engineer"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Topic</span>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Distributed systems design"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Skills (comma-separated)</span>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. Node.js, PostgreSQL, system design"
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        className="mt-2 h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        Start interview
      </button>
    </form>
  );
}
