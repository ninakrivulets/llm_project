export interface RecipeSource {
  title: string;
  ingredients: string;
  steps: string[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: RecipeSource[];
}

export interface ChatResult {
  answer: string;
  sources: RecipeSource[];
}

export async function sendChat(
  message: string,
  history: Message[],
): Promise<ChatResult> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  return { answer: data.answer, sources: data.sources ?? [] };
}

export async function getRecipeCount(): Promise<number> {
  const res = await fetch("/api/recipes/count");
  const data = await res.json();
  return data.count;
}
