const { GoogleGenAI } = require("@google/genai");

// Gemini is the primary provider; Groq is the automatic fallback.
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createQuotaError = () => {
  const error = new Error(
    "Vajp's AI usage limit has been reached. Please try again later."
  );
  error.status = 429;
  error.code = "AI_QUOTA_EXCEEDED";
  return error;
};

const getErrorStatus = (error) => {
  const directStatus = Number(error?.status);

  if (Number.isFinite(directStatus) && directStatus > 0) {
    return directStatus;
  }

  const match = String(error?.message || "").match(
    /\b(429|500|502|503|504)\b/
  );

  return match ? Number(match[1]) : 0;
};

const isQuotaError = (error) => {
  const message = String(error?.message || "");

  return (
    getErrorStatus(error) === 429 ||
    /RESOURCE_EXHAUSTED|quota exceeded|rate limit/i.test(
      message
    )
  );
};

const isRetryableError = (error) => {
  const status = getErrorStatus(error);
  const message = String(error?.message || "");

  return (
    [500, 502, 503, 504].includes(status) ||
    /UNAVAILABLE|high demand|temporarily unavailable|timeout|ECONNRESET|fetch failed/i.test(
      message
    )
  );
};

// Ask Gemini with retries for temporary errors.
const generateWithGemini = async (
  instructions,
  input,
  textFormat
) => {
  if (!geminiClient) {
    const error = new Error(
      "GEMINI_API_KEY is not configured."
    );
    error.code = "GEMINI_NOT_CONFIGURED";
    throw error;
  }

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
      const response =
        await geminiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: JSON.stringify(input),
          config,
        });

      const output = response.text;

      if (!output || !output.trim()) {
        throw new Error("Gemini returned an empty response.");
      }

      return output.trim();
    } catch (error) {
      if (isQuotaError(error)) {
        error.code = error.code || "AI_QUOTA_EXCEEDED";
        throw error;
      }

      const retryable = isRetryableError(error);

      console.error("Gemini API error:", {
        message: error.message,
        status: getErrorStatus(error) || undefined,
        model: GEMINI_MODEL,
        attempt: attempt + 1,
      });

      if (!retryable || attempt === 2) {
        throw error;
      }

      await sleep(1000 * (attempt + 1));
    }
  }

  throw new Error("Gemini could not generate a response.");
};

// Groq uses an OpenAI-compatible chat completions endpoint.
const generateWithGroq = async (
  instructions,
  input,
  textFormat
) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "GROQ_API_KEY is not configured."
    );
    error.code = "GROQ_NOT_CONFIGURED";
    throw error;
  }

  let systemInstruction = instructions;

  if (textFormat?.schema) {
    systemInstruction +=
      "\n\nReturn valid JSON only. Follow this JSON schema exactly:\n" +
      JSON.stringify(textFormat.schema);
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        ...(textFormat
          ? {
              response_format: {
                type: "json_object",
              },
            }
          : {}),
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    const error = new Error(
      `Groq API request failed (${response.status}): ${errorBody.slice(
        0,
        500
      )}`
    );

    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const output = data?.choices?.[0]?.message?.content;

  if (typeof output !== "string" || !output.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return output.trim();
};

// Try Gemini first; switch to Groq on quota or temporary errors.
const createAIResponse = async (
  instructions,
  input,
  textFormat
) => {
  if (!geminiClient) {
    console.warn(
      "Gemini is not configured. Using Groq directly."
    );

    return generateWithGroq(
      instructions,
      input,
      textFormat
    );
  }

  try {
    const output = await generateWithGemini(
      instructions,
      input,
      textFormat
    );

    console.info("Vajp AI provider: Gemini");
    return output;
  } catch (error) {
    const fallbackEligible =
      isQuotaError(error) ||
      isRetryableError(error) ||
      error.code === "GEMINI_NOT_CONFIGURED";

    if (!fallbackEligible) {
      throw error;
    }

    console.warn("Gemini unavailable. Switching to Groq.", {
      status: getErrorStatus(error) || undefined,
      reason: isQuotaError(error)
        ? "quota/rate limit"
        : "temporary provider failure",
    });

    try {
      const output = await generateWithGroq(
        instructions,
        input,
        textFormat
      );

      console.info("Vajp AI provider: Groq fallback");
      return output;
    } catch (fallbackError) {
      console.error("Groq fallback failed:", {
        message: fallbackError.message,
        status: getErrorStatus(fallbackError) || undefined,
      });

      // Preserve the quota-specific message if both providers fail.
      if (
        isQuotaError(error) &&
        !process.env.GROQ_API_KEY
      ) {
        throw createQuotaError();
      }

      throw new Error(
        "Vajp AI is temporarily unavailable. Please try again later."
      );
    }
  }
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
  const validLimit = Number.isFinite(safeLimit)
    ? Math.max(0, safeLimit)
    : 0;

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
          recommendedAmount: {
            type: "NUMBER",
          },
          reason: {
            type: "STRING",
          },
          goalImpact: {
            type: "STRING",
          },
          alternative: {
            type: "STRING",
          },
          action: {
            type: "STRING",
          },
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
    throw new Error(
      "Vajp returned an invalid purchase-advice response."
    );
  }

  if (
    !["BUY", "WAIT", "AVOID"].includes(advice.decision) ||
    typeof advice.recommendedAmount !== "number" ||
    !Number.isFinite(advice.recommendedAmount) ||
    !["reason", "goalImpact", "alternative", "action"].every(
      (key) => typeof advice[key] === "string"
    )
  ) {
    throw new Error(
      "Vajp returned invalid purchase-advice fields."
    );
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

const getGeneralAIResponse = async (
  question,
  financialData = {}
) => {
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
