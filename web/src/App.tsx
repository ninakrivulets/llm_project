import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Welcome from "./components/Welcome";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { getRecipeCount, sendChat, type Message, type RecipeSource } from "./api";
import SourcesPanel from "./components/SourcesPanel";
import { loadHistory, saveHistory } from "./storage";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [panelSources, setPanelSources] = useState<RecipeSource[] | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Load history from encrypted localStorage on mount
  useEffect(() => {
    loadHistory().then((history) => {
      if (history.length > 0) setMessages(history);
    });
  }, []);

  useEffect(() => {
    getRecipeCount().then(setRecipeCount).catch(() => {});
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
  }, [messages, loading, typingIndex]);

  // Scroll during typewriter animation
  useEffect(() => {
    if (typingIndex === null) return;
    const id = setInterval(() => {
      messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
    }, 60);
    return () => clearInterval(id);
  }, [typingIndex]);

  const busy = loading || typingIndex !== null;

  // Warn before closing tab while bot is thinking
  useEffect(() => {
    if (!busy) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [busy]);

  const handleTypingDone = useCallback(() => {
    setTypingIndex(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    setMessages([]);
    saveHistory([]);
  }, []);

  const handleSend = async (text: string) => {
    if (text.trim() === "/clear") {
      handleClearHistory();
      return;
    }
    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const { answer, sources } = await sendChat(text, newHistory);
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "assistant" as const, content: answer, sources },
        ];
        setTypingIndex(next.length - 1);
        saveHistory(next);
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            role: "assistant" as const,
            content:
              "Не удалось подключиться к серверу. Убедитесь, что API запущен.",
          },
        ];
        saveHistory(next);
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-text">
      <Header recipeCount={recipeCount} onClearHistory={handleClearHistory} />

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2 custom-scrollbar"
      >
        {messages.length === 0 && !loading ? (
          <Welcome onSend={handleSend} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                sources={msg.sources}
                typing={i === typingIndex}
                onTypingDone={handleTypingDone}
                onShowSources={setPanelSources}
              />
            ))}
            {loading && (
              <div className="flex justify-center w-full">
                <div className="max-w-[720px] w-full px-5 py-4 rounded-2xl">
                  <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">
                    Recipe AI
                  </div>
                  <div className="inline-flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={busy} />
      <div className="text-center px-4 pb-3.5 text-xs text-text-secondary">
        Recipe AI может ошибаться. Проверяйте информацию об аллергенах.
      </div>

      <SourcesPanel
        sources={panelSources}
        onClose={() => setPanelSources(null)}
      />
    </div>
  );
}
