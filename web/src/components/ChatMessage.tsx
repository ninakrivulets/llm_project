import { useEffect, useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
  onTypingDone?: () => void;
}

function formatMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

const CHARS_PER_TICK = 3;
const TICK_MS = 20;

export default function ChatMessage({
  role,
  content,
  typing,
  onTypingDone,
}: ChatMessageProps) {
  const [displayed, setDisplayed] = useState(typing ? "" : content);

  useEffect(() => {
    if (!typing) {
      setDisplayed(content);
      return;
    }

    let i = 0;
    const id = setInterval(() => {
      i += CHARS_PER_TICK;
      if (i >= content.length) {
        setDisplayed(content);
        clearInterval(id);
        onTypingDone?.();
      } else {
        setDisplayed(content.slice(0, i));
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [content, typing, onTypingDone]);

  return (
    <div className="flex justify-center w-full">
      <div
        className={`max-w-[720px] w-full px-5 py-4 rounded-2xl text-[15px] leading-[1.65] whitespace-pre-wrap break-words ${
          role === "user"
            ? "bg-user-bg border border-border"
            : "bg-transparent"
        }`}
      >
        {role === "assistant" && (
          <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">
            Recipe AI
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: formatMd(displayed) }} />
      </div>
    </div>
  );
}
