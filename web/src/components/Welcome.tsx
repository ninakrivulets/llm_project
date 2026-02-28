import { useMemo } from "react";

const SUGGESTIONS = [
  "Ужин без глютена за 40 минут",
  "Десерт из того, что есть дома",
  "Быстрый завтрак для детей",
  "Вегетарианский суп на неделю",
  "Что приготовить из курицы и картошки",
  "Лёгкий салат без майонеза",
  "Выпечка без яиц",
  "Блюдо из остатков риса",
  "Романтический ужин на двоих",
  "Закуски к вину за 15 минут",
  "Здоровый обед до 400 калорий",
  "Паста без варки соуса",
  "Что испечь из творога",
  "Рецепт с авокадо",
  "Суп из заморозки",
  "Пирог к чаю из простых продуктов",
  "Блюда для пикника",
  "Острое мясное блюдо",
  "Смузи для бодрости с утра",
  "Рецепт без духовки и плиты",
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

interface WelcomeProps {
  onSend: (text: string) => void;
}

export default function Welcome({ onSend }: WelcomeProps) {
  const cards = useMemo(() => pickRandom(SUGGESTIONS, 3), []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-secondary text-center px-10">
      <div className="text-5xl mb-2">🍳</div>
      <h2 className="text-[22px] font-semibold text-text">Чем могу помочь?</h2>
      <div className="flex flex-col gap-2 mt-3 w-full max-w-[400px]">
        {cards.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSend(suggestion)}
            className="text-left px-4 py-3 rounded-xl border border-border bg-bg text-text text-sm leading-snug hover:border-accent hover:text-accent transition-colors duration-150 cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
