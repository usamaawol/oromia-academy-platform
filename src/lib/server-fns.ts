/**
 * TanStack Start server functions — all privileged exam operations.
 *
 * Every function that touches answer keys, passwords, timers or grading runs
 * here. The browser never receives sensitive data.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeader } from "@tanstack/react-start/server";

import {
  fsGet,
  fsSet,
  fsCreate,
  fsDelete,
  fsList,
  fsQuery,
  sha256Hex,
  randomShuffle,
  systemDiagnostics,
} from "./fb-admin.server";
import { requireProfile, requireStaff, requireAdmin, logAudit, AppError } from "./authz.server";
import { autoGrade, examWindowState } from "./exam-engine";
import type {
  Profile,
  Exam,
  Question,
  Attempt,
  AttemptView,
  ResultView,
  Course,
  AcademySettings,
  AuditEntry,
} from "./schema";
import type { UserProfile } from "./types";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function getToken(): string {
  const h = getRequestHeader("x-id-token") ?? "";
  return h;
}

// Schema helpers
const ExamSchema = z.object({
  id: z.string(),
  title: z.string(),
  courseId: z.string(),
  topic: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  language: z.enum(["om", "en", "both"]),
  startAt: z.number().nullable(),
  endAt: z.number().nullable(),
  durationMin: z.number(),
  maxAttempts: z.number(),
  passMark: z.number(),
  questionIds: z.array(z.string()),
  poolSize: z.number(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  allowBackward: z.boolean(),
  requireFullscreen: z.boolean(),
  resultPolicy: z.enum(["immediate", "manual", "scheduled"]),
  resultsPublishAt: z.number().nullable(),
  status: z.enum(["draft", "active", "closed", "archived"]),
  hasPassword: z.boolean().optional(),
  showAnswersAfter: z.boolean().optional(),
  anonymous: z.boolean().optional(),
});

const QuestionSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  topic: z.string(),
  type: z.enum(["mcq", "truefalse", "short", "essay"]),
  language: z.enum(["om", "en", "both"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  textOm: z.string(),
  textEn: z.string().optional(),
  options: z.array(z.object({ id: z.string(), textOm: z.string(), textEn: z.string().optional() })),
  correctOptionId: z.string().optional(),
  correctBool: z.boolean().optional(),
  expectedAnswer: z.string().optional(),
  rubric: z.string().optional(),
  points: z.number(),
  tags: z.array(z.string()),
  approved: z.boolean(),
});

const CourseSchema = z.object({
  id: z.string(),
  titleOm: z.string(),
  titleEn: z.string(),
  descOm: z.string(),
  descEn: z.string(),
  icon: z.string().optional(),
  level: z.enum(["easy", "medium", "hard"]),
  status: z.enum(["active", "draft", "archived"]),
  order: z.number().optional(),
});

// ---------------------------------------------------------------------------
// EXAM — student start
// ---------------------------------------------------------------------------

export const startExam = createServerFn({ method: "POST" })
  .validator(
    z.object({
      examId: z.string(),
      password: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<AttemptView> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    const now = Date.now();

    const exam = await fsGet<Exam & { passwordHash?: string }>("exams", data.examId);
    if (!exam) throw new AppError("exam/not-found");
    if (exam.status !== "active") throw new AppError("exam/not-open");

    const win = examWindowState(exam as Exam, now);
    if (win !== "open") throw new AppError("exam/not-open");

    // Password check
    if (exam.hasPassword) {
      const secret = await fsGet<{ hash: string }>("examSecrets", data.examId);
      if (!secret) throw new AppError("exam/password-required");
      const submitted = await sha256Hex(data.password.trim());
      if (submitted !== secret.hash) throw new AppError("exam/wrong-password");
    }

    // Attempt count check
    const existing = await fsQuery<Attempt>("examAttempts", [
      ["examId", "EQUAL", data.examId],
      ["studentId", "EQUAL", profile.id],
    ]);
    const maxAttempts = exam.maxAttempts ?? 0;
    if (maxAttempts > 0 && existing.length >= maxAttempts)
      throw new AppError("exam/no-attempts-left");

    // Resume in-progress attempt if exists
    const inProgress = existing.find((a) => a.status === "in_progress");
    if (inProgress) {
      const questions = await loadPublicQuestions(exam as Exam, inProgress);
      return buildAttemptView(exam as Exam, inProgress, questions, now);
    }

    // Fetch and select questions
    const allQuestions = await Promise.all(
      exam.questionIds.map((id) => fsGet<Question>("questions", id)),
    );
    const valid = allQuestions.filter((q): q is Question => q !== null);
    const seed = `${data.examId}-${profile.id}-${existing.length + 1}`;

    // Shuffle and pool using server-side random
    let selected = [...valid];
    if (exam.shuffleQuestions) selected = randomShuffle(selected);
    if (exam.poolSize > 0 && exam.poolSize < selected.length) {
      selected = selected.slice(0, exam.poolSize);
    }

    const questionOrder = selected.map((q) => q.id);
    const optionOrders: Record<string, string[]> = {};
    for (const q of selected) {
      optionOrders[q.id] =
        exam.shuffleOptions && q.type === "mcq"
          ? randomShuffle(q.options.map((o) => o.id))
          : q.options.map((o) => o.id);
    }

    const durationMs = (exam.durationMin ?? 60) * 60 * 1000;
    const attemptData: Omit<Attempt, "id"> = {
      examId: exam.id,
      examTitle: exam.title,
      courseId: exam.courseId,
      studentId: profile.id,
      studentName: profile.fullName,
      attemptNumber: existing.length + 1,
      status: "in_progress",
      questionOrder,
      optionOrders,
      answers: {},
      startedAt: now,
      expiresAt: now + durationMs,
      submittedAt: null,
      autoScore: 0,
      manualScore: 0,
      totalPoints: selected.reduce((s, q) => s + q.points, 0),
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: selected.length,
      percentage: 0,
      passed: false,
      needsManualGrading: false,
      published: false,
    };

    const attemptId = await fsCreate(
      "examAttempts",
      attemptData as unknown as Record<string, unknown>,
    );
    const attempt = { ...attemptData, id: attemptId } as Attempt;

    const publicQuestions = selected.map((q) => ({
      questionId: q.id,
      type: q.type,
      points: q.points,
      textOm: q.textOm,
      ...(q.textEn ? { textEn: q.textEn } : {}),
      options: optionOrders[q.id]!.map((oid) => {
        const opt = q.options.find((o) => o.id === oid)!;
        return { id: opt.id, textOm: opt.textOm, ...(opt.textEn ? { textEn: opt.textEn } : {}) };
      }),
    }));

    return {
      attempt: {
        id: attemptId,
        examId: exam.id,
        examTitle: exam.title,
        status: "in_progress",
        startedAt: now,
        expiresAt: attempt.expiresAt,
        submittedAt: null,
        answers: {},
        allowBackward: exam.allowBackward,
        requireFullscreen: exam.requireFullscreen,
        language: exam.language,
      },
      questions: publicQuestions,
      serverNow: now,
    };
  });

async function loadPublicQuestions(exam: Exam, attempt: Attempt) {
  const questions = await Promise.all(
    attempt.questionOrder.map((id) => fsGet<Question>("questions", id)),
  );
  return attempt.questionOrder
    .map((id) => {
      const q = questions.find((x) => x?.id === id);
      if (!q) return null;
      const optOrder = attempt.optionOrders?.[id] ?? q.options.map((o) => o.id);
      return {
        questionId: q.id,
        type: q.type,
        points: q.points,
        textOm: q.textOm,
        ...(q.textEn ? { textEn: q.textEn } : {}),
        options: optOrder.map((oid) => {
          const opt = q.options.find((o) => o.id === oid)!;
          return { id: opt.id, textOm: opt.textOm, ...(opt.textEn ? { textEn: opt.textEn } : {}) };
        }),
      };
    })
    .filter(Boolean) as AttemptView["questions"];
}

function buildAttemptView(
  exam: Exam,
  attempt: Attempt,
  questions: AttemptView["questions"],
  now: number,
): AttemptView {
  return {
    attempt: {
      id: attempt.id,
      examId: exam.id,
      examTitle: exam.title,
      status: attempt.status,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers ?? {},
      allowBackward: exam.allowBackward,
      requireFullscreen: exam.requireFullscreen,
      language: exam.language,
    },
    questions,
    serverNow: now,
  };
}

// ---------------------------------------------------------------------------
// EXAM — save answer (auto-save)
// ---------------------------------------------------------------------------

export const saveAnswer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      attemptId: z.string(),
      questionId: z.string(),
      answer: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; serverNow: number }> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    const now = Date.now();

    const attempt = await fsGet<Attempt>("examAttempts", data.attemptId);
    if (!attempt) throw new AppError("attempt/not-found");
    if (attempt.studentId !== profile.id) throw new AppError("auth/forbidden");
    if (attempt.status !== "in_progress") throw new AppError("attempt/already-submitted");
    if (now > attempt.expiresAt) {
      // Auto-expire — grade and submit
      await _submitAttempt(attempt, now);
      return { ok: true, serverNow: now };
    }

    const answers = { ...(attempt.answers ?? {}), [data.questionId]: data.answer };
    await fsSet("examAttempts", data.attemptId, { answers });
    return { ok: true, serverNow: now };
  });

// ---------------------------------------------------------------------------
// EXAM — submit
// ---------------------------------------------------------------------------

export const submitExam = createServerFn({ method: "POST" })
  .validator(z.object({ attemptId: z.string() }))
  .handler(async ({ data }): Promise<ResultView | { published: false }> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    const now = Date.now();

    const attempt = await fsGet<Attempt>("examAttempts", data.attemptId);
    if (!attempt) throw new AppError("attempt/not-found");
    if (attempt.studentId !== profile.id) throw new AppError("auth/forbidden");
    if (attempt.status !== "in_progress") throw new AppError("attempt/already-submitted");

    return _submitAttempt(attempt, now);
  });

async function _submitAttempt(
  attempt: Attempt,
  now: number,
): Promise<ResultView | { published: false }> {
  // Load questions to grade
  const questions = await Promise.all(
    attempt.questionOrder.map((id) => fsGet<Question>("questions", id)),
  );
  const valid = questions.filter((q): q is Question => q !== null);

  // Build presentation for grader
  const presented = attempt.questionOrder.map((qid) => ({
    questionId: qid,
    optionOrder: attempt.optionOrders?.[qid] ?? [],
  }));

  const grade = autoGrade(presented, valid, attempt.answers ?? {});
  const exam = await fsGet<Exam>("exams", attempt.examId);
  const passMark = exam?.passMark ?? 50;
  const percentage =
    grade.totalPoints > 0 ? Math.round((grade.autoScore / grade.totalPoints) * 100) : 0;

  const patch: Partial<Attempt> = {
    status: "graded" as const,
    submittedAt: now,
    autoScore: grade.autoScore,
    totalPoints: grade.totalPoints,
    correctCount: grade.correctCount,
    wrongCount: grade.wrongCount,
    unansweredCount: grade.unansweredCount,
    needsManualGrading: grade.needsManualGrading,
    percentage,
    passed: percentage >= passMark,
    manualScore: 0,
  };

  await fsSet("examAttempts", attempt.id, patch as unknown as Record<string, unknown>);

  const resultPolicy = exam?.resultPolicy ?? "immediate";
  if (resultPolicy !== "immediate") {
    return { published: false };
  }

  return {
    attemptId: attempt.id,
    examId: attempt.examId,
    examTitle: attempt.examTitle,
    submittedAt: now,
    totalPoints: grade.totalPoints,
    score: grade.autoScore,
    percentage,
    passed: percentage >= passMark,
    correctCount: grade.correctCount,
    wrongCount: grade.wrongCount,
    unansweredCount: grade.unansweredCount,
    needsManualGrading: grade.needsManualGrading,
  };
}

// ---------------------------------------------------------------------------
// EXAM — get result (student)
// ---------------------------------------------------------------------------

export const getMyResult = createServerFn({ method: "GET" })
  .validator(z.object({ attemptId: z.string() }))
  .handler(async ({ data }): Promise<ResultView | { published: false }> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);

    const attempt = await fsGet<Attempt>("examAttempts", data.attemptId);
    if (!attempt) throw new AppError("attempt/not-found");
    if (attempt.studentId !== profile.id) throw new AppError("auth/forbidden");
    if (!attempt.published) return { published: false };

    const exam = await fsGet<Exam>("exams", attempt.examId);

    // Build question review if exam allows showing answers
    let questionReview: ResultView["questionReview"] | undefined;
    if (exam?.showAnswersAfter) {
      const questionDocs = await Promise.all(
        attempt.questionOrder.map((id) => fsGet<Question>("questions", id)),
      );
      const valid = questionDocs.filter((q): q is Question => q !== null);
      const answers = attempt.answers ?? {};

      questionReview = attempt.questionOrder.map((qid) => {
        const q = valid.find((x) => x.id === qid);
        if (!q) return null;
        const yourAnswer = answers[qid] ?? "";
        let correctAnswer = "";
        let result: "correct" | "wrong" | "partial" | "unanswered" = "unanswered";
        let earned = 0;

        if (q.type === "mcq") {
          correctAnswer = q.correctOptionId ?? "";
          if (!yourAnswer) { result = "unanswered"; }
          else if (yourAnswer === q.correctOptionId) { result = "correct"; earned = q.points; }
          else { result = "wrong"; }
        } else if (q.type === "truefalse") {
          correctAnswer = q.correctBool === true ? "true" : "false";
          if (!yourAnswer) { result = "unanswered"; }
          else if (yourAnswer === correctAnswer) { result = "correct"; earned = q.points; }
          else { result = "wrong"; }
        } else {
          // short/essay — use manual grades if available
          const mg = attempt.manualGrades?.[qid];
          if (!yourAnswer) { result = "unanswered"; }
          else if (mg) { earned = mg.points; result = mg.points >= q.points ? "correct" : mg.points > 0 ? "partial" : "wrong"; }
          else { result = "unanswered"; correctAnswer = q.expectedAnswer ?? ""; }
        }

        return {
          questionId: qid,
          textOm: q.textOm,
          textEn: q.textEn,
          type: q.type,
          yourAnswer,
          correctAnswer,
          result,
          points: q.points,
          earned,
          options: q.options,
        };
      }).filter(Boolean) as NonNullable<ResultView["questionReview"]>;
    }

    return {
      attemptId: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.examTitle,
      submittedAt: attempt.submittedAt ?? null,
      totalPoints: attempt.totalPoints,
      score: attempt.autoScore + attempt.manualScore,
      percentage: attempt.percentage,
      passed: attempt.passed,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      unansweredCount: attempt.unansweredCount,
      needsManualGrading: attempt.needsManualGrading,
      ...(attempt.feedback ? { feedback: attempt.feedback } : {}),
      ...(questionReview ? { questionReview } : {}),
    };
  });

// ---------------------------------------------------------------------------
// ADMIN — exam CRUD
// ---------------------------------------------------------------------------

export const adminListExams = createServerFn({ method: "GET" }).handler(
  async (): Promise<Exam[]> => {
    const idToken = getToken();
    await requireStaff(idToken);
    return fsList<Exam>("exams");
  },
);

export const adminSaveExam = createServerFn({ method: "POST" })
  .validator(
    z.object({
      exam: ExamSchema,
      password: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ id: string }> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);

    const { exam, password } = data;
    const isNew = !(await fsGet("exams", exam.id));

    // Store password hash separately — never in the main exam doc.
    // A blank password keeps any existing secret; turning the switch off
    // (exam.hasPassword === false) removes it.
    let hasPassword = Boolean(exam.hasPassword);
    const hasNewPassword = Boolean(password && password.trim());
    if (hasNewPassword && password) {
      const hash = await sha256Hex(password.trim());
      await fsSet("examSecrets", exam.id, { hash });
      hasPassword = true;
    } else if (!hasPassword) {
      await fsDelete("examSecrets", exam.id).catch(() => undefined);
    }

    const examDoc = { ...exam, hasPassword, updatedAt: Date.now() };
    if (isNew) (examDoc as Record<string, unknown>)["createdAt"] = Date.now();
    await fsSet("exams", exam.id, examDoc as unknown as Record<string, unknown>);
    await logAudit(actor, isNew ? "exam.create" : "exam.update", exam.id, exam.title);
    return { id: exam.id };
  });

export const adminDeleteExam = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    await fsDelete("exams", data.id);
    await fsDelete("examSecrets", data.id).catch(() => undefined);
    await logAudit(actor, "exam.delete", data.id);
  });

// ---------------------------------------------------------------------------
// ADMIN — question bank CRUD
// ---------------------------------------------------------------------------

export const adminListQuestions = createServerFn({ method: "GET" })
  .validator(z.object({ courseId: z.string().optional() }))
  .handler(async ({ data }): Promise<Question[]> => {
    const idToken = getToken();
    await requireStaff(idToken);
    if (data.courseId) {
      return fsQuery<Question>("questions", [["courseId", "EQUAL", data.courseId]]);
    }
    return fsList<Question>("questions");
  });

export const adminSaveQuestion = createServerFn({ method: "POST" })
  .validator(z.object({ question: QuestionSchema }))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    const q = data.question;
    const isNew = !(await fsGet("questions", q.id));
    await fsSet("questions", q.id, {
      ...q,
      updatedAt: Date.now(),
      ...(isNew ? { createdAt: Date.now() } : {}),
    } as unknown as Record<string, unknown>);
    await logAudit(
      actor,
      isNew ? "question.create" : "question.update",
      q.id,
      q.textOm.slice(0, 60),
    );
    return { id: q.id };
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    await fsDelete("questions", data.id);
    await logAudit(actor, "question.delete", data.id);
  });

// ---------------------------------------------------------------------------
// ADMIN — courses CRUD
// ---------------------------------------------------------------------------

export const adminListCourses = createServerFn({ method: "GET" }).handler(
  async (): Promise<Course[]> => {
    const idToken = getToken();
    await requireStaff(idToken);
    return fsList<Course>("courses");
  },
);

export const adminSaveCourse = createServerFn({ method: "POST" })
  .validator(z.object({ course: CourseSchema }))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    const c = data.course;
    const isNew = !(await fsGet("courses", c.id));
    await fsSet("courses", c.id, {
      ...c,
      updatedAt: Date.now(),
      ...(isNew ? { createdAt: Date.now() } : {}),
    } as unknown as Record<string, unknown>);
    await logAudit(actor, isNew ? "course.create" : "course.update", c.id, c.titleEn);
    return { id: c.id };
  });

export const adminDeleteCourse = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    await fsDelete("courses", data.id);
    await logAudit(actor, "course.delete", data.id);
  });

// ---------------------------------------------------------------------------
// ADMIN — students / users
// ---------------------------------------------------------------------------

export const adminListStudents = createServerFn({ method: "GET" }).handler(
  async (): Promise<Profile[]> => {
    const idToken = getToken();
    await requireStaff(idToken);
    return fsList<Profile>("users");
  },
);

export const adminSetRole = createServerFn({ method: "POST" })
  .validator(
    z.object({ userId: z.string(), role: z.enum(["owner", "admin", "instructor", "student"]) }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    if (actor.id === data.userId && data.role !== actor.role)
      throw new AppError("auth/cannot-change-own-role");
    await fsSet("users", data.userId, { role: data.role, updatedAt: Date.now() });
    await logAudit(actor, "user.role", data.userId, data.role);
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string(), status: z.enum(["active", "suspended"]) }))
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    await fsSet("users", data.userId, { status: data.status, updatedAt: Date.now() });
    await logAudit(actor, "user.status", data.userId, data.status);
  });

// ---------------------------------------------------------------------------
// ADMIN — results / grading
// ---------------------------------------------------------------------------

export const adminListAttempts = createServerFn({ method: "GET" })
  .validator(z.object({ examId: z.string().optional() }))
  .handler(async ({ data }): Promise<Attempt[]> => {
    const idToken = getToken();
    await requireStaff(idToken);
    if (data.examId) {
      return fsQuery<Attempt>("examAttempts", [["examId", "EQUAL", data.examId]]);
    }
    return fsList<Attempt>("examAttempts");
  });

export const adminGradeAttempt = createServerFn({ method: "POST" })
  .validator(
    z.object({
      attemptId: z.string(),
      manualGrades: z.record(z.object({ points: z.number(), feedback: z.string().optional() })),
      feedback: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);

    const attempt = await fsGet<Attempt>("examAttempts", data.attemptId);
    if (!attempt) throw new AppError("attempt/not-found");

    const exam = await fsGet<Exam>("exams", attempt.examId);
    const manualScore = Object.values(data.manualGrades).reduce((s, g) => s + (g.points || 0), 0);
    const total = attempt.autoScore + manualScore;
    const percentage =
      attempt.totalPoints > 0 ? Math.round((total / attempt.totalPoints) * 100) : 0;
    const passMark = exam?.passMark ?? 50;

    await fsSet("examAttempts", data.attemptId, {
      manualGrades: data.manualGrades,
      manualScore,
      percentage,
      passed: percentage >= passMark,
      status: "graded",
      needsManualGrading: false,
      feedback: data.feedback ?? "",
      gradedAt: Date.now(),
    } as unknown as Record<string, unknown>);
    await logAudit(actor, "attempt.grade", data.attemptId);
  });

export const adminPublishResult = createServerFn({ method: "POST" })
  .validator(z.object({ attemptId: z.string(), published: z.boolean() }))
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    await fsSet("examAttempts", data.attemptId, {
      published: data.published,
      publishedAt: data.published ? Date.now() : null,
    });
    await logAudit(actor, data.published ? "result.publish" : "result.unpublish", data.attemptId);
  });

export const adminPublishAllResults = createServerFn({ method: "POST" })
  .validator(z.object({ examId: z.string() }))
  .handler(async ({ data }): Promise<{ count: number }> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    const attempts = await fsQuery<Attempt>("examAttempts", [["examId", "EQUAL", data.examId]]);
    const graded = attempts.filter((a) => a.status === "graded" && !a.published);
    await Promise.all(
      graded.map((a) => fsSet("examAttempts", a.id, { published: true, publishedAt: Date.now() })),
    );
    await logAudit(actor, "result.publishAll", data.examId, `${graded.length} results`);
    return { count: graded.length };
  });

// ---------------------------------------------------------------------------
// ADMIN — audit log
// ---------------------------------------------------------------------------

export const adminListAudit = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuditEntry[]> => {
    const idToken = getToken();
    await requireAdmin(idToken);
    const all = await fsList<AuditEntry>("auditLogs");
    return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 300);
  },
);

// ---------------------------------------------------------------------------
// ADMIN — settings
// ---------------------------------------------------------------------------

export const adminGetSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<AcademySettings> => {
    const idToken = getToken();
    await requireStaff(idToken);
    const s = await fsGet<AcademySettings>("settings", "academy");
    return (
      s ?? {
        telegramHandle: "",
        telegramUrl: "",
        announcementOm: "",
        announcementEn: "",
        contactEmail: "",
        contactPhone: "",
      }
    );
  },
);

export const adminSaveSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      settings: z.object({
        telegramHandle: z.string(),
        telegramUrl: z.string(),
        announcementOm: z.string(),
        announcementEn: z.string(),
        contactEmail: z.string(),
        contactPhone: z.string(),
      }),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    await fsSet("settings", "academy", data.settings as unknown as Record<string, unknown>);
    await logAudit(actor, "settings.update");
  });

// ---------------------------------------------------------------------------
// ADMIN — analytics
// ---------------------------------------------------------------------------

export const adminGetAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const idToken = getToken();
  await requireStaff(idToken);

  const [attempts, exams, users, courses] = await Promise.all([
    fsList<Attempt>("examAttempts"),
    fsList<Exam>("exams"),
    fsList<Profile>("users"),
    fsList<Course>("courses"),
  ]);

  const submitted = attempts.filter((a) => a.status !== "in_progress");
  const students = users.filter((u) => u.role === "student");
  const avgScore =
    submitted.length > 0
      ? Math.round(submitted.reduce((s, a) => s + (a.percentage ?? 0), 0) / submitted.length)
      : 0;
  const passCount = submitted.filter((a) => a.passed).length;
  const passRate = submitted.length > 0 ? Math.round((passCount / submitted.length) * 100) : 0;
  const activeExams = exams.filter((e) => e.status === "active").length;

  // Per-exam stats
  const examStats = exams.map((exam) => {
    const examAttempts = submitted.filter((a) => a.examId === exam.id);
    const examAvg =
      examAttempts.length > 0
        ? Math.round(
            examAttempts.reduce((s, a) => s + (a.percentage ?? 0), 0) / examAttempts.length,
          )
        : 0;
    const examPass =
      examAttempts.length > 0
        ? Math.round((examAttempts.filter((a) => a.passed).length / examAttempts.length) * 100)
        : 0;
    return {
      id: exam.id,
      title: exam.title,
      attempts: examAttempts.length,
      avgScore: examAvg,
      passRate: examPass,
    };
  });

  return {
    totalStudents: students.length,
    totalCourses: courses.length,
    totalExams: exams.length,
    activeExams,
    totalAttempts: submitted.length,
    avgScore,
    passRate,
    examStats,
  };
});

// ---------------------------------------------------------------------------
// STUDENT — list my attempts
// ---------------------------------------------------------------------------

export const myAttempts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Attempt[]> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    return fsQuery<Attempt>("examAttempts", [["studentId", "EQUAL", profile.id]]);
  },
);

// ---------------------------------------------------------------------------
// STUDENT — list available exams
// ---------------------------------------------------------------------------

export const availableExams = createServerFn({ method: "GET" }).handler(
  async (): Promise<Exam[]> => {
    const idToken = getToken();
    await requireProfile(idToken);
    const all = await fsQuery<Exam>("exams", [["status", "EQUAL", "active"]]);
    const now = Date.now();
    return all.filter((e) => examWindowState(e, now) === "open" || e.status === "active");
  },
);

// ---------------------------------------------------------------------------
// STUDENT — get exam info (no password, no answers)
// ---------------------------------------------------------------------------

export const getExamInfo = createServerFn({ method: "GET" })
  .validator(z.object({ examId: z.string() }))
  .handler(
    async ({
      data,
    }): Promise<Omit<Exam, "questionIds"> & { questionCount: number; hasPassword: boolean }> => {
      const idToken = getToken();
      await requireProfile(idToken);
      const exam = await fsGet<Exam & { passwordHash?: string; hasPassword?: boolean }>(
        "exams",
        data.examId,
      );
      if (!exam) throw new AppError("exam/not-found");
      const { questionIds, ...rest } = exam;
      return { ...rest, questionCount: questionIds.length, hasPassword: exam.hasPassword ?? false };
    },
  );

// ---------------------------------------------------------------------------
// NOTIFICATIONS — push (admin)
// ---------------------------------------------------------------------------

export const adminPushNotification = createServerFn({ method: "POST" })
  .validator(
    z.object({
      notification: z.object({
        userId: z.string(),
        titleOm: z.string(),
        titleEn: z.string(),
        bodyOm: z.string().optional(),
        bodyEn: z.string().optional(),
      }),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);
    await fsCreate("notifications", { ...data.notification, createdAt: Date.now() });
    await logAudit(actor, "notification.push", data.notification.userId);
  });

// ---------------------------------------------------------------------------
// AUTH — get current profile (used by client to confirm session)
// ---------------------------------------------------------------------------

export const getMyProfile = createServerFn({ method: "GET" }).handler(
  async (): Promise<Profile> => {
    const idToken = getToken();
    return requireProfile(idToken);
  },
);

// ---------------------------------------------------------------------------
// AUTH — update user profile (student can update their own info)
// ---------------------------------------------------------------------------

export const updateMyProfile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullName: z.string().optional(),
      phone: z.string().optional(),
      department: z.string().optional(),
      nickname: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (data.fullName !== undefined) updates["fullName"] = data.fullName;
    if (data.phone !== undefined) updates["phone"] = data.phone;
    if (data.department !== undefined) updates["department"] = data.department;
    if (data.nickname !== undefined) updates["nickname"] = data.nickname;
    await fsSet("users", profile.id, updates);
  });

// ---------------------------------------------------------------------------
// AUTH — setup owner account (one-time setup)
// ---------------------------------------------------------------------------

export const getOwnerStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ hasOwner: boolean }> => {
    const idToken = getToken();
    await requireProfile(idToken);
    const users = await fsList<Profile>("users");
    return { hasOwner: users.some((u) => u.role === "owner") };
  },
);

/**
 * Bootstraps the academy owner. Lets the first signed-in account on a fresh
 * database claim the `owner` role so the admin panel can be reached. Server
 * enforces that an owner does not already exist.
 */
export const claimOwner = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    const users = await fsList<Profile>("users");
    if (users.some((u) => u.role === "owner")) {
      throw new AppError("auth/owner-exists");
    }
    await fsSet("users", profile.id, { role: "owner", updatedAt: Date.now() });
    await logAudit(profile, "user.role", profile.id, "owner");
    return { success: true };
  },
);

export const setupOwnerAccount = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const users = await fsList<Profile>("users");
    const existingOwner = users.find((u) => u.role === "owner");
    if (existingOwner) {
      throw new AppError("auth/owner-exists");
    }

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user) {
      throw new AppError("auth/user-not-found");
    }

    // Set role to owner
    await fsSet("users", user.id, { role: "owner", updatedAt: Date.now() });
    return { success: true };
  });

// ---------------------------------------------------------------------------
// RANKING — get student rankings
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// USER PROFILE — create user profile server-side (bypasses security rules)
// ---------------------------------------------------------------------------

export const createUserProfile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      fullName: z.string(),
      email: z.string(),
      phone: z.string().optional(),
      department: z.string().optional(),
      courseId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const existing = await fsGet<UserProfile>("users", data.id);
    if (existing) {
      // Profile already exists, just return it
      return existing;
    }

    const profile: UserProfile = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: "student",
      enrolledCourseIds: data.courseId ? [data.courseId] : [],
      createdAt: Date.now(),
      ...(data.phone && { phone: data.phone }),
      ...(data.department && { department: data.department }),
    };

    await fsSet("users", data.id, profile);
    return profile;
  });

// ---------------------------------------------------------------------------
// RANKING — get student rankings
// ---------------------------------------------------------------------------

export const getRankings = createServerFn({ method: "GET" }).handler(async () => {
  const idToken = getToken();
  await requireProfile(idToken);

  const [attempts, users] = await Promise.all([
    fsList<Attempt>("examAttempts"),
    fsList<Profile>("users"),
  ]);

  const submitted = attempts.filter((a) => a.status === "graded" && a.published);
  const students = users.filter((u) => u.role === "student");

  // Calculate scores per student
  const studentScores = students.map((student) => {
    const studentAttempts = submitted.filter((a) => a.studentId === student.id);
    const totalScore = studentAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0);
    const avgScore =
      studentAttempts.length > 0 ? Math.round(totalScore / studentAttempts.length) : 0;
    const examCount = studentAttempts.length;
    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      avgScore,
      examCount,
      totalScore,
    };
  });

  // Sort by average score, then by exam count
  studentScores.sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return b.examCount - a.examCount;
  });

  // Add rank
  return studentScores.map((s, index) => ({
    ...s,
    rank: index + 1,
  }));
});

// ---------------------------------------------------------------------------
// LEADERBOARD — per-exam anonymous rankings
// ---------------------------------------------------------------------------

export const getExamLeaderboard = createServerFn({ method: "GET" })
  .validator(z.object({ examId: z.string() }))
  .handler(async ({ data }) => {
    const idToken = getToken();
    await requireProfile(idToken);

    const [attempts, users] = await Promise.all([
      fsQuery<Attempt>("examAttempts", [["examId", "EQUAL", data.examId]]),
      fsList<Profile>("users"),
    ]);

    const graded = attempts.filter((a) => a.status === "graded" && a.published);
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Best attempt per student
    const bestByStudent = new Map<string, Attempt>();
    for (const a of graded) {
      const prev = bestByStudent.get(a.studentId);
      if (!prev || a.percentage > prev.percentage) bestByStudent.set(a.studentId, a);
    }

    const ranked = [...bestByStudent.values()]
      .sort((a, b) => b.percentage - a.percentage)
      .map((a, idx) => {
        const user = userMap.get(a.studentId);
        const nickname = user?.nickname || `Student${(idx + 1).toString().padStart(3, "0")}`;
        return {
          rank: idx + 1,
          nickname,
          percentage: a.percentage,
          passed: a.passed,
          score: a.autoScore + a.manualScore,
          totalPoints: a.totalPoints,
        };
      });

    return ranked;
  });

// ---------------------------------------------------------------------------
// DIAGNOSTICS — server configuration health (staff only)
// ---------------------------------------------------------------------------

export const adminDiagnostics = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff(getToken());
  return systemDiagnostics();
});

// ---------------------------------------------------------------------------
// AI IMPORT — extract questions from pasted text (server-side, uses OpenRouter)
// ---------------------------------------------------------------------------

export const adminAiExtractQuestions = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().min(10) }))
  .handler(async ({ data }) => {
    const idToken = getToken();
    await requireStaff(idToken);

    const apiKey =
      process.env["OPENROUTER_API_KEY"] ??
      process.env["VITE_OPENROUTER_API_KEY"] ??
      "";

    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured. Add it to your .env file.",
      );
    }

    // Dynamic import keeps ai-import.server.ts out of the client bundle
    const { aiExtractQuestions } = await import("./ai-import.server");
    return aiExtractQuestions(data.text, apiKey);
  });

// ---------------------------------------------------------------------------
// AI IMPORT — bulk save approved extracted questions to Question Bank
// ---------------------------------------------------------------------------

const AiQuestionSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  topic: z.string(),
  type: z.enum(["mcq", "truefalse", "short", "essay"]),
  language: z.enum(["om", "en", "both"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  textOm: z.string(),
  textEn: z.string().optional(),
  options: z.array(
    z.object({ id: z.string(), textOm: z.string(), textEn: z.string().optional() }),
  ),
  correctOptionId: z.string().optional(),
  correctBool: z.boolean().optional(),
  expectedAnswer: z.string().optional(),
  rubric: z.string().optional(),
  explanationOm: z.string().optional(),
  explanationEn: z.string().optional(),
  points: z.number(),
  tags: z.array(z.string()),
  approved: z.boolean(),
});

export const adminBulkSaveQuestions = createServerFn({ method: "POST" })
  .validator(z.object({ questions: z.array(AiQuestionSchema) }))
  .handler(async ({ data }): Promise<{ saved: number; ids: string[] }> => {
    const idToken = getToken();
    const actor = await requireStaff(idToken);

    const ids: string[] = [];
    for (const q of data.questions) {
      const isNew = !(await fsGet("questions", q.id));
      // Store explanationOm/En as rubric so they're accessible in the question record
      const record = {
        ...q,
        rubric: q.rubric || q.explanationOm || "",
        updatedAt: Date.now(),
        ...(isNew ? { createdAt: Date.now() } : {}),
      };
      // Remove AI-only fields not in the core schema
      const { explanationOm: _eo, explanationEn: _ee, ...clean } = record as typeof record & { explanationOm?: string; explanationEn?: string };
      await fsSet("questions", q.id, clean as unknown as Record<string, unknown>);
      ids.push(q.id);
    }

    await logAudit(
      actor,
      "question.bulkImport",
      undefined,
      `${ids.length} questions imported via AI`,
    );

    return { saved: ids.length, ids };
  });

