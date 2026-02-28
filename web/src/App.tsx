import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Welcome from "./components/Welcome";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { getRecipeCount, sendChat, type Message } from "./api";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRecipeCount().then(setRecipeCount).catch(() => {});
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight);
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const answer = await sendChat(text, newHistory);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Не удалось подключиться к серверу. Убедитесь, что API запущен.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-text">
      <Header recipeCount={recipeCount} />

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2 custom-scrollbar"
      >
        {messages.length === 0 && !loading ? (
          <Welcome />
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
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

      <ChatInput onSend={handleSend} disabled={loading} />
      <div className="text-center px-4 pb-3.5 text-xs text-text-secondary">
        Recipe AI может ошибаться. Проверяйте информацию об аллергенах.
      </div>
    </div>
  );
}
