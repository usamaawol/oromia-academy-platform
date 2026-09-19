/**
 * Server-side AI question extraction using OpenRouter.
 * This file is server-only — never imported from client code.
 *
 * Pipeline:
 *   Raw text → AI (OpenRouter) → JSON → Schema validation → Validated questions
 */

export type AiExtractedOption = {
  key: "A" | "B" | "C" | "D";
  textOm: string;
  textEn: string;
};

export type AiExtractedQuestion = {
  questionNumber: number;
  type: "mcq" | "truefalse" | "short" | "essay";
  questionOm: string;
  questionEn: string;
  options: AiExtractedOption[];
  correctAnswer: string | null; // "A" | "B" | "C" | "D" | "true" | "false" | null
  explanationOm: string;
  explanationEn: string;
  // validation
  warnings: string[];
  valid: boolean;
};

export type AiExtractionResult = {
  questions: AiExtractedQuestion[];
  totalDetected: number;
  totalValid: number;
  totalInvalid: number;
  rawJson?: string; // for debugging
};

const SYSTEM_PROMPT = `You are a question extraction assistant for Oromia Academy, an educational platform that uses Afaan Oromoo and English.

Your task is to extract exam questions from the provided text and return them as structured JSON.

RULES:
1. Identify every question in the text — do NOT skip any.
2. Preserve the exact question text as written (both Afaan Oromoo and English if both exist).
3. Extract options A, B, C, D exactly as written.
4. Identify the correct answer key (A, B, C, D, true, false).
5. Extract the explanation if present.
6. If a field is missing, use an empty string — do NOT invent content.
7. If the correct answer is missing, set correctAnswer to null and add a warning.
8. If an option is missing, add a warning — do NOT invent options.
9. Support bilingual questions where both Afaan Oromoo and English are provided.
10. If only one language is present, put it in the Oromoo field (textOm) and leave the English field empty.
11. Return ONLY valid JSON — no markdown, no explanation text outside the JSON.

OUTPUT FORMAT (strict JSON):
{
  "questions": [
    {
      "questionNumber": 1,
      "type": "mcq",
      "questionOm": "...",
      "questionEn": "",
      "options": [
        { "key": "A", "textOm": "...", "textEn": "" },
        { "key": "B", "textOm": "...", "textEn": "" },
        { "key": "C", "textOm": "...", "textEn": "" },
        { "key": "D", "textOm": "...", "textEn": "" }
      ],
      "correctAnswer": "A",
      "explanationOm": "...",
      "explanationEn": "",
      "warnings": []
    }
  ]
}

If a question has problems, include messages in the "warnings" array like:
- "Correct answer is missing"
- "Option C is missing"
- "Question text is empty"
- "Only 2 options found"
`;

function validateExtracted(q: AiExtractedQuestion, idx: number): AiExtractedQuestion {
  const warnings = [...(q.warnings ?? [])];

  if (!q.questionOm?.trim() && !q.questionEn?.trim()) {
    warnings.push("Question text is empty");
  }

  if (q.type === "mcq") {
    if (!q.options || q.options.length < 2) {
      warnings.push(`Only ${q.options?.length ?? 0} options found — expected at least 2`);
    }
    if (!q.correctAnswer) {
      warnings.push("Correct answer is missing");
    } else {
      const validKeys = (q.options ?? []).map((o) => o.key);
      if (!validKeys.includes(q.correctAnswer as "A" | "B" | "C" | "D")) {
        warnings.push(`Correct answer "${q.correctAnswer}" does not match any option key`);
      }
    }
    // Check for missing standard options
    const keys = (q.options ?? []).map((o) => o.key);
    for (const expected of ["A", "B", "C", "D"] as const) {
      if (!keys.includes(expected)) warnings.push(`Option ${expected} is missing`);
    }
  }

  if (q.type === "truefalse") {
    if (!q.correctAnswer || !["true", "false"].includes(q.correctAnswer.toLowerCase())) {
      warnings.push("Correct answer must be 'true' or 'false'");
    }
  }

  const valid =
    warnings.filter(
      (w) =>
        w.includes("missing") ||
        w.includes("empty") ||
        w.includes("does not match"),
    ).length === 0;

  return {
    ...q,
    questionNumber: q.questionNumber ?? idx + 1,
    type: q.type ?? "mcq",
    questionOm: q.questionOm ?? "",
    questionEn: q.questionEn ?? "",
    options: q.options ?? [],
    correctAnswer: q.correctAnswer ?? null,
    explanationOm: q.explanationOm ?? "",
    explanationEn: q.explanationEn ?? "",
    warnings,
    valid,
  };
}

function safeParseJson(raw: string): { questions: AiExtractedQuestion[] } | null {
  // Strip markdown code fences if the model wrapped the JSON
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
  }
  try {
    const parsed = JSON.parse(cleaned) as { questions?: AiExtractedQuestion[] };
    if (Array.isArray(parsed.questions)) return parsed as { questions: AiExtractedQuestion[] };
    // Maybe the model returned an array directly
    if (Array.isArray(parsed)) return { questions: parsed as AiExtractedQuestion[] };
    return null;
  } catch {
    return null;
  }
}

const BATCH_SIZE = 25; // questions per AI request to stay within token limits

/**
 * Split a block of text into individual question blocks.
 * Used for batching large inputs without losing context.
 */
function splitIntoBlocks(text: string): string[] {
  // Split on patterns like "Question1:", "Question 1:", "Q1:", "1.", "1)"
  const blocks = text
    .split(/(?=(?:Question\s*\d+\s*:|Q\s*\d+\s*[:.]\s*|\d+[.)]\s+))/i)
    .map((b) => b.trim())
    .filter((b) => b.length > 10);
  return blocks.length > 1 ? blocks : [text];
}

/**
 * Main extraction function — called from the server function.
 * Handles batching if the input contains many questions.
 */
export async function aiExtractQuestions(
  rawText: string,
  apiKey: string,
): Promise<AiExtractionResult> {
  const blocks = splitIntoBlocks(rawText);
  const batches: string[][] = [];

  for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
    batches.push(blocks.slice(i, i + BATCH_SIZE));
  }

  const allExtracted: AiExtractedQuestion[] = [];
  let lastRawJson = "";

  for (const batch of batches) {
    const batchText = batch.join("\n\n");
    const result = await extractBatch(batchText, apiKey);
    lastRawJson = result.rawJson;
    allExtracted.push(...result.questions);
  }

  // Re-number questions sequentially after combining batches
  const validated = allExtracted.map((q, i) => validateExtracted(q, i));

  const totalValid = validated.filter((q) => q.valid).length;
  const totalInvalid = validated.length - totalValid;

  return {
    questions: validated,
    totalDetected: validated.length,
    totalValid,
    totalInvalid,
    rawJson: lastRawJson,
  };
}

async function extractBatch(
  text: string,
  apiKey: string,
): Promise<{ questions: AiExtractedQuestion[]; rawJson: string }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "http-referer": "https://oromia-academy.web.app",
      "x-title": "Oromia Academy",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extract all questions from the following text and return them as JSON:\n\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown error");
    throw new Error(`AI API error ${res.status}: ${errText}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };

  if (json.error) throw new Error(`AI error: ${json.error.message}`);

  const content = json.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI returned empty response");

  const parsed = safeParseJson(content);
  if (!parsed) {
    throw new Error("AI returned invalid JSON — could not parse question data");
  }

  return { questions: parsed.questions, rawJson: content };
}
