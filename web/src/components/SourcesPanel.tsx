import { useEffect } from "react";
import type { RecipeSource } from "../api";

interface SourcesPanelProps {
  sources: RecipeSource[] | null;
  onClose: () => void;
}

export default function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  const open = sources !== null;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-bg-secondary z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">Источники</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text transition-colors cursor-pointer p-1"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 custom-scrollbar">
          {sources?.map((recipe, i) => (
            <div
              key={i}
              className="bg-bg rounded-xl p-4 border border-border"
            >
              <h3 className="text-sm font-semibold text-accent mb-2">
                {recipe.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-2">
                <span className="text-text font-medium">Ингредиенты: </span>
                {recipe.ingredients}
              </p>
              {recipe.steps.length > 0 && (
                <div className="text-xs text-text-secondary leading-relaxed">
                  <span className="text-text font-medium">Шаги: </span>
                  <ol className="list-decimal list-inside mt-1 flex flex-col gap-0.5">
                    {recipe.steps.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
