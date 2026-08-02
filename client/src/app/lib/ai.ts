import api from "./api";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatResponse {
  answer: string;
  disclaimer: string;
}

export const sendAIMessage = (
  token: string,
  message: string,
  history: AIChatMessage[]
) =>
  api<AIChatResponse>("/ai/chat", {
    method: "POST",
    token,
    body: JSON.stringify({
      message,
      history,
    }),
  });