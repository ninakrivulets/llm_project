export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function sendChat(
  message: string,
  history: Message[],
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  return data.answer;
}

export async function getRecipeCount(): Promise<number> {
  const res = await fetch("/api/recipes/count");
  const data = await res.json();
  return data.count;
}
