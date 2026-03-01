import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-4 flex justify-center">
      <div className="max-w-[720px] w-full flex gap-2.5 bg-bg-secondary border border-border rounded-2xl pl-[18px] pr-1.5 py-1.5 focus-within:border-accent transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Опишите, что хотите приготовить..."
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-text font-[inherit] text-[15px] resize-none leading-normal py-2 placeholder:text-text-secondary max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="self-end w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-default hover:not-disabled:opacity-85 transition-opacity cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
