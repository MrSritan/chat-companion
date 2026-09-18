import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getInitialThreadId } from "@/lib/chat-storage";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Athena Chat — Your AI workspace" },
      { name: "description", content: "Start or continue a focused conversation with Athena." },
      { property: "og:title", content: "Athena Chat — Your AI workspace" },
      { property: "og:description", content: "Start or continue a focused conversation with Athena." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const threadId = getInitialThreadId();
    navigate({ to: "/chat/$threadId", params: { threadId }, replace: true });
  }, [navigate]);

  return <div className="min-h-screen bg-background" />;
}
