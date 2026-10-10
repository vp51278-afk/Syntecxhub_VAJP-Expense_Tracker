
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from backend environment variables.");
}

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createQuotaError = () => {
  const error = new Error(
    "Vajp's AI usage limit has been reached. Please try again in about 13 hours."
  );
  error.status = 429;
  error.code = "AI_QUOTA_EXCEEDED";
  error.retryAfterSeconds = 13 * 60 * 60;
  return error;
};

const createAIResponse = async (instructions, input, textFormat) => {
  const config = {
    systemInstruction: instructions,
    temperature: 0.2,
  };

  if (textFormat) {
    config.responseMimeType = "application/json";
    config.responseSchema = textFormat.schema;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: MODEL,
        contents: JSON.stringify(input),
        config,
      });

      const output = response.text;

      if (!output) {
        throw new Error("Vajp returned an empty response.");
      }

      return output.trim();
    } catch (error) {
      const message = String(error.message || "");
      const status = Number(error.status || error.code);

      const quotaExceeded =
        status === 429 ||
        /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(message);

      if (quotaExceeded) {
        throw createQuotaError();
      }

      const retryable =
        [500, 502, 503, 504].includes(status) ||
        /UNAVAILABLE|high demand|temporarily unavailable/i.test(message);

      console.error("Gemini API error:", {
        message,
        status: status || undefined,
        model: MODEL,
        attempt: attempt + 1,
      });

      if (!retryable || attempt === 2) {
        throw error;
      }

      await sleep(1000 * (attempt + 1));
    }
  }

  throw new Error("Vajp could not get a response. Please try again.");
};

const getAIAdvisor = async (financialData = {}) => {
  const {
    monthlyIncome,
    currentExpenses,
    balance,
    safeToSpend,
    itemName,
    price,
    category,
    purchaseType,
    reason,
    goals = [],
  } = financialData;

  const safeLimit = Number(safeToSpend);
  const validLimit = Number.isFinite(safeLimit) ? Math.max(0, safeLimit) : 0;
  const validPrice = Number(price);

  const output = await createAIResponse(
    `You are Vajp Expense, the personal AI money advisor inside ExpenseFlow.

Evaluate purchases using only supplied financial data.

Rules:
1. Never invent financial figures or claim access to bank accounts.
2. Treat figures as estimates from recorded transactions.
3. Choose BUY, WAIT, or AVOID based on affordability, needs, and goals.
4. Never recommend BUY if the price exceeds Safe To Spend.
5. Explain savings and goal impact without inventing amounts.
6. Suggest a lower-cost alternative when useful.
7. Never recommend gambling or risky financial products.
8. Keep advice practical and concise.
9. recommendedAmount must be between 0 and Safe To Spend.
10. If essential financial data is missing, prefer WAIT.
11. Return only JSON matching the supplied schema.`,
    {
      task: "Evaluate this purchase.",
      financialInformation: {
        monthlyIncome: monthlyIncome ?? null,
        currentExpenses: currentExpenses ?? null,
        balance: balance ?? null,
        safeToSpend: safeToSpend ?? null,
      },
      purchaseInformation: {
        itemName: itemName ?? null,
        price: price ?? null,
        category: category ?? null,
        purchaseType: purchaseType ?? null,
        reason: reason ?? null,
      },
      goals: Array.isArray(goals) ? goals : [],
    },
    {
      schema: {
        type: "OBJECT",
        properties: {
          decision: {
            type: "STRING",
            enum: ["BUY", "WAIT", "AVOID"],
          },
          recommendedAmount: { type: "NUMBER" },
          reason: { type: "STRING" },
          goalImpact: { type: "STRING" },
          alternative: { type: "STRING" },
          action: { type: "STRING" },
        },
        required: [
          "decision",
          "recommendedAmount",
          "reason",
          "goalImpact",
          "alternative",
          "action",
        ],
      },
    }
  );

  let advice;

  try {
    advice = JSON.parse(output);
  } catch {
    throw new Error("Vajp returned an invalid purchase-advice response.");
  }

  if (
    !["BUY", "WAIT", "AVOID"].includes(advice.decision) ||
    !Number.isFinite(advice.recommendedAmount) ||
    !["reason", "goalImpact", "alternative", "action"].every(
      (key) => typeof advice[key] === "string"
    )
  ) {
    throw new Error("Vajp returned invalid purchase-advice fields.");
  }

  if (
    !Number.isFinite(validPrice) ||
    !Number.isFinite(safeLimit) ||
    validPrice <= 0 ||
    safeLimit < 0 ||
    validPrice > validLimit
  ) {
    advice.decision = "WAIT";
    advice.reason =
      "The purchase price or available spending limit is missing or insufficient. Verify your financial data before buying.";
  }

  advice.recommendedAmount = Math.max(
    0,
    Math.min(validLimit, advice.recommendedAmount)
  );

  return advice;
};

const getGeneralAIResponse = async (question, financialData = {}) => {
  const context = {
    ...financialData,
    goals: Array.isArray(financialData.goals)
      ? financialData.goals.map((goal) => ({
          name: goal.name,
          target: goal.target,
          saved: goal.saved,
          deadline: goal.deadline,
        }))
      : [],
  };

  return createAIResponse(
    `You are Vajp Expense, the personal AI money advisor inside ExpenseFlow.

Answer questions about budgeting, saving, spending, financial goals, and purchases.

Rules:
1. Answer directly and naturally.
2. Use only the supplied financial data. Never invent amounts, transactions, goals, or savings figures.
3. If monthly income, expenses, or balance is null or unavailable, explicitly say it is unavailable. Do not treat zero as proof of the user's actual financial situation.
4. A goal's saved value is a recorded goal figure, not a verified bank balance.
5. monthlyGoalContributions is an estimate calculated from goal targets and deadlines. It does NOT mean the user is actually contributing or depositing that amount every month.
6. Never say "you currently contribute" unless actual contribution records were explicitly supplied.
7. Never infer monthly contributions from a goal's saved amount, target, or deadline.
8. Mention a specific goal or rupee amount only if it exists in the supplied financial data.
9. If goal data is absent or empty, do not mention a specific goal or savings amount.
10. If income and expenses are unavailable, do not claim to calculate personalized affordability or an exact savings target.
11. Give practical, achievable next steps.
12. Do not recommend gambling, risky financial products, or unnecessary loans.
13. For unrelated questions, politely explain that you specialize in personal finance.
14. Use clean Markdown: concise headings, bold labels, numbered steps, and bullet points when helpful.
15. Return Markdown text only, not JSON.`,
    {
      question,
      financialData: context,
    }
  );
};

module.exports = getAIAdvisor;
module.exports.getGeneralAIResponse = getGeneralAIResponse;






