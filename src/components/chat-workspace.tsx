"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sync,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  createThreadId,
  readThreads,
  writeThreads,
  type ChatMessage,
  type ChatThread,
} from "@/lib/chat-storage";
import { cn } from "@/lib/utils";

function BrandMark() {
  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm" aria-hidden="true">
      <span className="font-display text-sm font-semibold">A</span>
    </div>
  );
}

function SidebarContent({
  threads,
  activeId,
  onSelect,
  onNew,
  onClose,
}: {
  threads: ChatThread[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border p-3">
        <div className="flex min-w-0 items-center gap-2">
          <BrandMark />
          <span className="truncate font-display text-sm font-semibold text-foreground">Athena</span>
        </div>
        {onClose && <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar"><PanelLeftClose /></Button>}
      </div>
      <div className="space-y-1 p-3">
        <Button className="w-full justify-start shadow-none" onClick={onNew}><Plus />New chat</Button>
        <Button className="w-full justify-start text-muted-foreground" variant="ghost"><Search />Search chats</Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pb-2 pt-4 text-xs font-semibold text-muted-foreground">Recent</p>
        <div className="space-y-1">
          {threads.map((thread) => (
            <div key={thread.id} className={cn("group grid grid-cols-[minmax(0,1fr)_auto] items-center rounded-md", thread.id === activeId ? "bg-secondary" : "hover:bg-muted")}>
              <Button
                variant="ghost"
                className="min-w-0 justify-start bg-transparent px-2 shadow-none hover:bg-transparent"
                onClick={() => onSelect(thread.id)}
              >
                <MessageSquareText className="shrink-0" />
                <span className="truncate">{thread.title}</span>
              </Button>
              <Button variant="ghost" size="icon-sm" className="mr-1 opacity-0 group-hover:opacity-100" aria-label={`More options for ${thread.title}`}><MoreHorizontal /></Button>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">TJ</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">T. Jarvis</p><p className="text-xs text-muted-foreground">Browser workspace</p></div>
        </div>
      </div>
    </div>
  );
}

export function ChatWorkspace({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [status, setStatus] = useState<"ready" | "submitted">("ready");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const stored = readThreads();
    if (!stored.some((thread) => thread.id === threadId)) {
      const created: ChatThread = { id: threadId, title: "New conversation", updatedAt: Date.now(), messages: [] };
      const next = [created, ...stored];
      writeThreads(next);
      setThreads(next);
    } else {
      setThreads(stored);
    }
    setHydrated(true);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }, [threadId]);

  const activeThread = useMemo(() => threads.find((thread) => thread.id === threadId), [threads, threadId]);

  const persist = (updater: (current: ChatThread[]) => ChatThread[]) => {
    setThreads((current) => {
      const next = updater(current);
      writeThreads(next);
      return next;
    });
    setSyncing(true);
    window.setTimeout(() => setSyncing(false), 650);
  };

  const newChat = () => {
    const id = createThreadId();
    const next: ChatThread = { id, title: "New conversation", updatedAt: Date.now(), messages: [] };
    persist((current) => [next, ...current]);
    setSidebarOpen(false);
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const selectThread = (id: string) => {
    setSidebarOpen(false);
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  const sendMessage = ({ text }: { text: string }) => {
    const value = text.trim();
    if (!value || status !== "ready") return;
    const userMessage: ChatMessage = { id: `m-${Date.now()}`, role: "user", parts: [{ type: "text", text: value }] };
    persist((current) => current.map((thread) => thread.id === threadId ? {
      ...thread,
      title: thread.messages.length === 0 ? value.slice(0, 42) : thread.title,
      updatedAt: Date.now(),
      messages: [...thread.messages, userMessage],
    } : thread));
    setStatus("submitted");
    window.setTimeout(() => {
      const reply: ChatMessage = { id: `m-${Date.now()}-a`, role: "assistant", parts: [{ type: "text", text: "This is the visual preview of your chat workspace. Connect an AI service later to receive live answers here." }] };
      persist((current) => current.map((thread) => thread.id === threadId ? { ...thread, updatedAt: Date.now(), messages: [...thread.messages, reply] } : thread));
      setStatus("ready");
      window.setTimeout(() => textareaRef.current?.focus(), 0);
    }, 900);
  };

  if (!hydrated || !activeThread) return <div className="min-h-screen bg-background" />;

  return (
    <main className="flex h-dvh overflow-hidden bg-background">
      {!sidebarCollapsed && <aside className="hidden w-72 shrink-0 border-r border-border lg:block"><SidebarContent threads={threads} activeId={threadId} onSelect={selectThread} onNew={newChat} onClose={() => setSidebarCollapsed(true)} /></aside>}

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-foreground/20" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[min(86vw,20rem)] border-r border-border shadow-xl"><SidebarContent threads={threads} activeId={threadId} onSelect={selectThread} onNew={newChat} onClose={() => setSidebarOpen(false)} /></aside>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="grid h-14 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/85 px-3 backdrop-blur sm:px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu /></Button>
          {sidebarCollapsed && <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setSidebarCollapsed(false)} aria-label="Open sidebar"><PanelLeftOpen /></Button>}
          <Button variant="ghost" className="min-w-0 justify-start px-2 font-display font-semibold shadow-none">
            <span className="truncate">Athena Chat</span><ChevronDown className="shrink-0 text-muted-foreground" />
          </Button>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground" title="Saved in this browser">
            {syncing ? <Sync className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-primary" />}
            <span className="hidden sm:inline">{syncing ? "Saving" : "Saved"}</span>
          </div>
        </header>

        <Conversation className="min-h-0">
          <ConversationContent className="mx-auto w-full max-w-3xl gap-7 px-4 py-8 sm:px-8">
            {activeThread.messages.length === 0 ? (
              <ConversationEmptyState className="min-h-[55vh]" title="Ready when you are." description="Ask a question, explore an idea, or start a draft." icon={<BrandMark />} />
            ) : activeThread.messages.map((message) => (
              <Message key={message.id} from={message.role} className="max-w-[88%] sm:max-w-[82%]">
                <MessageContent className={cn(message.role === "user" && "bg-primary text-primary-foreground") }>
                  {message.parts.map((part, index) => <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>)}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Message from="assistant"><MessageContent><Shimmer>Thinking...</Shimmer></MessageContent></Message>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="shrink-0 bg-background px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <PromptInput onSubmit={sendMessage} className="rounded-xl border-border bg-card shadow-[0_10px_32px_color-mix(in_oklab,var(--foreground)_8%,transparent)]">
              <PromptInputTextarea ref={textareaRef} placeholder="Ask anything" className="min-h-14 px-4 text-[15px]" />
              <PromptInputFooter className="px-2 pb-2">
                <PromptInputTools>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Add attachment"><Plus /></Button>
                </PromptInputTools>
                <PromptInputSubmit status={status} disabled={status !== "ready"} />
              </PromptInputFooter>
            </PromptInput>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">Athena can make mistakes. Check important information.</p>
          </div>
        </div>
      </section>
    </main>
  );
}