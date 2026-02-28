interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

function formatMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
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
        <div dangerouslySetInnerHTML={{ __html: formatMd(content) }} />
      </div>
    </div>
  );
}
