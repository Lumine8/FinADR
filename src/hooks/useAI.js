import { useState } from "react";

export default function useAI() {
  const [analysis, setAnalysis] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // NEWLY RESTORED STATES ↓↓↓
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // --------------------------------------------
  // CORE CALL (your working 2.5 preview model)
  // --------------------------------------------
  const callGemini = async (systemPrompt, userPrompt) => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
          }),
        }
      );

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err) {
      console.error("Gemini error:", err);
      return null;
    }
  };

  // --------------------------------------------
  // CATEGORY SUGGESTION
  // --------------------------------------------
  const suggestCategory = async (title) => {
    if (!title.trim()) return null;

    const systemPrompt = `
      You categorize expenses.
      Valid categories: Food, Transport, Shopping, Bills, Entertainment, Other.
      Respond with ONLY the category.
    `;

    const raw = await callGemini(systemPrompt, title.trim());
    if (!raw) return null;

    return raw.trim().replace(/\n/g, "");
  };

  // --------------------------------------------
  // EXPLAIN PURCHASE ("Why?")
  // --------------------------------------------
  const explainPurchase = async (title) => {
    if (!title.trim()) return null;

    setIsExplaining(true);
    setExplanation("");

    const systemPrompt = `
      You explain human buying behavior.
      Include:
      - Why someone buys it
      - Emotional / psychological trigger
      - Spending pattern
      - Risk level (Low/Medium/High)
      Keep answers short.
    `;

    const res = await callGemini(systemPrompt, title.trim());
    setIsExplaining(false);

    if (!res) return "No explanation available.";
    setExplanation(res);

    return res;
  };

  // --------------------------------------------
  // MONTHLY ANALYSIS
  // --------------------------------------------
  const analyzeSpending = async (
    expenses,
    prevExpenses,
    settings,
    userInfo
  ) => {
    setIsAnalyzing(true);
    setAnalysis("");
    setAnalysisError("");

    const systemPrompt = `
      You are FinADR, a friendly finance coach.
      Provide:
      - 1 strength
      - comparison to last month
      - 3 improvement tips
      - motivational closing
    `;

    const userPrompt = `
      User: ${userInfo.name}
      Location: ${settings.location}
      Budgets: ${JSON.stringify(settings.budgets)}

      This Month:
      ${JSON.stringify(expenses)}

      Previous Month:
      ${JSON.stringify(prevExpenses)}
    `;

    const res = await callGemini(systemPrompt, userPrompt);

    if (!res) setAnalysisError("AI service unavailable.");
    else setAnalysis(res);

    setIsAnalyzing(false);
  };

  // --------------------------------------------
  // FINAL EXPORT (fully restored)
  // --------------------------------------------
  return {
    analysis,
    analysisError,
    isAnalyzing,

    explanation,
    isExplaining,
    setExplanation,
    setIsExplaining,

    suggestCategory,
    explainPurchase,
    analyzeSpending,
  };
}
