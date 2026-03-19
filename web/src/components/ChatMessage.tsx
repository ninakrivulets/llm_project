import { useEffect, useState } from "react";
import type { RecipeSource } from "../api";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: RecipeSource[];
  typing?: boolean;
  onTypingDone?: () => void;
  onShowSources?: (sources: RecipeSource[]) => void;
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
  sources,
  typing,
  onTypingDone,
  onShowSources,
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

  const hasSources = sources && sources.length > 0;

  return (
    <div className="flex justify-center w-full">
      <div
        className={`max-w-[720px] w-full px-5 py-4 rounded-2xl text-[15px] leading-[1.65] whitespace-pre-wrap break-words ${
          role === "user"
            ? "bg-user-bg"
            : "bg-transparent"
        }`}
      >
        {role === "assistant" && (
          <div className="text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">
            Recipe AI
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: formatMd(displayed) }} />
        {role === "assistant" && hasSources && !typing && (
          <button
            onClick={() => onShowSources?.(sources)}
            className="mt-3 text-xs text-text-secondary hover:text-text transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            Источники ({sources.length})
          </button>
        )}
      </div>
    </div>
  );
}
