interface HeaderProps {
  recipeCount: number | null;
  onClearHistory: () => void;
}

export default function Header({ recipeCount, onClearHistory }: HeaderProps) {
  return (
    <header className="flex items-center justify-center px-6 py-4 border-b border-border relative">
      <h1 className="text-base font-semibold tracking-tight text-text">
        Recipe AI
      </h1>
      <div className="absolute right-6 flex items-center gap-2">
        <button
          onClick={() => confirm("Очистить историю переписки?") && onClearHistory()}
          title="Очистить историю"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-accent opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5 bg-accent-dim text-accent px-3.5 py-1.5 rounded-full text-[13px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
        <span>
          {recipeCount !== null
            ? recipeCount.toLocaleString("ru-RU")
            : "—"}{" "}
          рецептов
        </span>
      </div>
      </div>
    </header>
  );
}
