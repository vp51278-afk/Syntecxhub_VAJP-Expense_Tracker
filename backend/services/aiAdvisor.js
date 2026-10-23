
const { GoogleGenAI } = require("@google/genai");


const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const GEMINI_TIMEOUT_MS = Math.max(
  1500,
  Number(process.env.GEMINI_TIMEOUT_MS) || 2500
);

const GROQ_TIMEOUT_MS = Math.max(
  3000,
  Number(process.env.GROQ_TIMEOUT_MS) || 8000
);


const withTimeout = (promise, timeoutMs, providerName) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(
        `${providerName} timed out after ${timeoutMs}ms`
      );
      error.code = "AI_PROVIDER_TIMEOUT";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const getErrorStatus = (error) => {
  const directStatus = Number(error?.status || error?.statusCode);

  if (Number.isFinite(directStatus) && directStatus > 0) {
    return directStatus;
  }

  const match = String(error?.message || "").match(
    /\b(429|500|502|503|504)\b/
  );

  return match ? Number(match[1]) : 0;
};

const isQuotaError = (error) =>
  getErrorStatus(error) === 429 ||
  /RESOURCE_EXHAUSTED|quota exceeded|rate.?limit/i.test(
    String(error?.message || "")
  );


const generateWithGemini = async (
  instructions,
  input,
  textFormat
) => {
  if (!geminiClient) {
    const error = new Error("GEMINI_API_KEY is not configured.");
    error.code = "GEMINI_NOT_CONFIGURED";
    throw error;
  }

  const config = {
    systemInstruction: instructions,
    temperature: 0.2,
  };

  if (textFormat?.schema) {
    config.responseMimeType = "application/json";
    config.responseSchema = textFormat.schema;
  }

  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: JSON.stringify(input),
    config,
  });

  const output = response?.text;

  if (typeof output !== "string" || !output.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  return output.trim();
};

const generateWithGroq = async (
  instructions,
  input,
  textFormat
) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured.");
    error.code = "GROQ_NOT_CONFIGURED";
    throw error;
  }

  let systemInstruction = instructions;

  if (textFormat?.schema) {
    systemInstruction +=
      "\n\nReturn valid JSON only. Follow this schema:\n" +
      JSON.stringify(textFormat.schema);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    GROQ_TIMEOUT_MS
  );

  const startedAt = Date.now();

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
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
          ...(textFormat?.schema
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
        `Groq request failed (${response.status}): ${errorBody.slice(
          0,
          300
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

    console.info("Vajp Groq response time:", Date.now() - startedAt, "ms");

    return output.trim();
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        `Groq timed out after ${GROQ_TIMEOUT_MS}ms`
      );

      timeoutError.code = "AI_PROVIDER_TIMEOUT";
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const createAIResponse = async (
  instructions,
  input,
  textFormat
) => {
  if (geminiClient) {
    const startedAt = Date.now();

    try {
      const output = await withTimeout(
        generateWithGemini(instructions, input, textFormat),
        GEMINI_TIMEOUT_MS,
        "Gemini"
      );

      console.info(
        "Vajp Gemini response time:",
        Date.now() - startedAt,
        "ms"
      );

      return output;
    } catch (error) {
      console.warn("Gemini failed; trying Groq fallback.", {
        durationMs: Date.now() - startedAt,
        status: getErrorStatus(error) || undefined,
        code: error.code || undefined,
        message: error.message,
      });
    }
  } else {
    console.warn("Gemini not configured; trying Groq.");
  }

  try {
    return await generateWithGroq(
      instructions,
      input,
      textFormat
    );
  } catch (error) {
    console.error("Vajp Groq fallback failed.", {
      status: getErrorStatus(error) || undefined,
      code: error.code || undefined,
      message: error.message,
    });

    const unavailable = new Error(
      isQuotaError(error)
        ? "Vajp AI usage limit reached. Please try again later."
        : "Vajp AI is temporarily unavailable. Please try again shortly."
    );

    unavailable.status = isQuotaError(error) ? 429 : 503;
    unavailable.code = error.code || "AI_PROVIDERS_UNAVAILABLE";

    throw unavailable;
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
    throw new Error("Vajp returned invalid purchase-advice fields.");
  }

  // Enforce the affordability rule in backend code,
  // regardless of what the AI recommends.
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
