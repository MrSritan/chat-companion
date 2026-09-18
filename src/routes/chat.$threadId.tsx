import { createFileRoute } from "@tanstack/react-router";
import { ChatWorkspace } from "@/components/chat-workspace";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Conversation — Athena Chat" },
      { name: "description", content: "A focused conversation in your Athena workspace." },
      { property: "og:title", content: "Conversation — Athena Chat" },
      { property: "og:description", content: "A focused conversation in your Athena workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatRoute,
});

function ChatRoute() {
  const { threadId } = Route.useParams();
  return <ChatWorkspace key={threadId} threadId={threadId} />;
}