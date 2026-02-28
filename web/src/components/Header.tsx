interface HeaderProps {
  recipeCount: number | null;
}

export default function Header({ recipeCount }: HeaderProps) {
  return (
    <header className="flex items-center justify-center px-6 py-4 border-b border-border relative">
      <h1 className="text-base font-semibold tracking-tight text-text">
        Recipe AI
      </h1>
      <div className="absolute right-6 flex items-center gap-1.5 bg-accent-dim text-accent px-3.5 py-1.5 rounded-full text-[13px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
        <span>
          {recipeCount !== null
            ? recipeCount.toLocaleString("ru-RU")
            : "—"}{" "}
          рецептов
        </span>
      </div>
    </header>
  );
}
