export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  parts: Array<{ type: "text"; text: string }>;
};

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const STORAGE_KEY = "athena-chat-threads-v1";

const starterThreads: ChatThread[] = [
  {
    id: "startup-funding-guide",
    title: "Startup funding guide",
    updatedAt: Date.now() - 1000 * 60 * 12,
    messages: [
      { id: "m1", role: "user", parts: [{ type: "text", text: "Help me understand the stages of startup funding." }] },
      { id: "m2", role: "assistant", parts: [{ type: "text", text: "Absolutely. We can work through each stage—from pre-seed and seed to later growth rounds—and focus on the trade-offs that matter to founders." }] },
    ],
  },
  {
    id: "rewrite-equations",
    title: "Rewrite equations clearly",
    updatedAt: Date.now() - 1000 * 60 * 60,
    messages: [{ id: "m3", role: "user", parts: [{ type: "text", text: "Can you make my equations easier to read?" }] }],
  },
  {
    id: "lab-report",
    title: "Lab report structure",
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    messages: [],
  },
];

export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return starterThreads;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterThreads));
    return starterThreads;
  }
  try {
    const parsed = JSON.parse(saved) as ChatThread[];
    return parsed.length ? parsed : starterThreads;
  } catch {
    return starterThreads;
  }
}

export function writeThreads(threads: ChatThread[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function getInitialThreadId() {
  return readThreads()[0]?.id ?? createThreadId();
}

export function createThreadId() {
  return `chat-${Date.now().toString(36)}`;
}