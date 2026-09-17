import type { Attempt, Exam, PresentedQuestion, Question } from "./types";

/** Deterministic shuffle from a seed so a student always gets the same layout. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Build the exact question/option layout a student receives (their exam "version"). */
export function buildPresentation(
  exam: Exam,
  questions: Question[],
  seed: string,
): PresentedQuestion[] {
  const rnd = seededRandom(seed);
  const byId = new Map(questions.map((q) => [q.id, q]));
  let ids = exam.questionIds.filter((id) => byId.has(id));

  if (exam.shuffleQuestions) ids = shuffle(ids, rnd);
  if (exam.poolSize > 0 && exam.poolSize < ids.length) {
    ids = (exam.shuffleQuestions ? ids : shuffle(ids, rnd)).slice(0, exam.poolSize);
  }

  return ids.map((id) => {
    const q = byId.get(id)!;
    const optionIds = q.options.map((o) => o.id);
    return {
      questionId: id,
      optionOrder: exam.shuffleOptions && q.type === "mcq" ? shuffle(optionIds, rnd) : optionIds,
    };
  });
}

export type GradeResult = {
  autoScore: number;
  totalPoints: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  needsManualGrading: boolean;
};

export function autoGrade(
  presented: PresentedQuestion[],
  questions: Question[],
  answers: Record<string, string>,
): GradeResult {
  const byId = new Map(questions.map((q) => [q.id, q]));
  let autoScore = 0;
  let totalPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let needsManualGrading = false;

  for (const p of presented) {
    const q = byId.get(p.questionId);
    if (!q) continue;
    totalPoints += q.points;
    const answer = answers[q.id];
    if (answer === undefined || answer === "") {
      unansweredCount++;
      if (q.type === "short" || q.type === "essay") needsManualGrading = true;
      continue;
    }
    if (q.type === "mcq") {
      if (answer === q.correctOptionId) {
        autoScore += q.points;
        correctCount++;
      } else wrongCount++;
    } else if (q.type === "truefalse") {
      if (answer === String(q.correctBool)) {
        autoScore += q.points;
        correctCount++;
      } else wrongCount++;
    } else {
      needsManualGrading = true;
    }
  }

  return { autoScore, totalPoints, correctCount, wrongCount, unansweredCount, needsManualGrading };
}

export function finalizeScores(
  attempt: Attempt,
  passMark: number,
): {
  percentage: number;
  passed: boolean;
  total: number;
  manualScore: number;
} {
  const manualScore = Object.values(attempt.manualGrades ?? {}).reduce(
    (s, g) => s + (g.points || 0),
    0,
  );
  const total = attempt.autoScore + manualScore;
  const percentage = attempt.totalPoints > 0 ? Math.round((total / attempt.totalPoints) * 100) : 0;
  return { percentage, passed: percentage >= passMark, total, manualScore };
}

export function examWindowState(exam: Exam, now: number): "before" | "open" | "after" {
  if (exam.startAt && now < exam.startAt) return "before";
  if (exam.endAt && now > exam.endAt) return "after";
  return "open";
}

export function isExamOpenForStudents(exam: Exam, now: number): boolean {
  if (exam.status !== "active" && exam.status !== "scheduled") return false;
  return examWindowState(exam, now) === "open";
}

export type ValidationIssue = { level: "error" | "warning"; message: string };

export function validateExam(exam: Exam, questions: Question[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!exam.title.trim()) issues.push({ level: "error", message: "Exam title is required." });
  if (!exam.courseId) issues.push({ level: "error", message: "A course must be selected." });
  if (exam.questionIds.length === 0)
    issues.push({ level: "error", message: "The exam has no questions." });
  if (!exam.password.trim())
    issues.push({ level: "error", message: "An exam password is required." });
  if (exam.durationMin <= 0)
    issues.push({ level: "error", message: "Duration must be greater than 0." });
  if (exam.startAt && exam.endAt && exam.endAt <= exam.startAt)
    issues.push({ level: "error", message: "End time must be after start time." });
  if (exam.poolSize > 0 && exam.poolSize > exam.questionIds.length)
    issues.push({
      level: "error",
      message: `Pool size (${exam.poolSize}) is larger than the number of selected questions (${exam.questionIds.length}).`,
    });

  const selected = questions.filter((q) => exam.questionIds.includes(q.id));
  for (const q of selected) {
    if (q.type === "mcq" && !q.correctOptionId)
      issues.push({
        level: "error",
        message: `MCQ "${q.text.slice(0, 40)}" has no correct answer.`,
      });
    if (q.type === "mcq" && q.options.length < 2)
      issues.push({
        level: "error",
        message: `MCQ "${q.text.slice(0, 40)}" needs at least 2 options.`,
      });
    if (!q.approved)
      issues.push({
        level: "warning",
        message: `Question "${q.text.slice(0, 40)}" is not approved yet.`,
      });
  }
  return issues;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
