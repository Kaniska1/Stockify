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

  export type RiskLevel =
  | "Low"
  | "Moderate"
  | "High"
  | "Very High";

export interface PortfolioRisk {
  title: string;
  description: string;
  severity: "Low" | "Moderate" | "High";
}

export interface PortfolioAnalysis {
  overallScore: number;
  riskLevel: RiskLevel;
  diversificationScore: number;
  cashUtilizationScore: number;
  concentrationScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keyRisks: PortfolioRisk[];
}

interface PortfolioAnalysisResponse {
  analysis: PortfolioAnalysis;
  disclaimer: string;
}

export const analyzePortfolioRequest = (
  token: string
) =>
  api<PortfolioAnalysisResponse>(
    "/ai/portfolio-analysis",
    {
      method: "POST",
      token,
    }
  );