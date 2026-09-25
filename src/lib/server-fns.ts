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
  ActivationCode,
  ActivationCodeAdminView,
  ActivationStatus,
  Enrollment,
  EnrollmentStatus,
  PaymentStatus,
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

    // Activation + enrollment gate
    // Staff bypass this check (they can preview exams).
    const staff: Profile["role"][] = ["owner", "admin", "instructor"];
    if (!staff.includes(profile.role)) {
      // 1. Account must be activated (pending -> /activate first)
      if (profile.activationStatus !== "active")
        throw new AppError("activation/activation-required");
      // 2. Must have an active, paid, non-expired enrollment for this course
      if (!(await hasActiveEnrollment(profile, exam.courseId)))
        throw new AppError("exam/not-enrolled");
    }

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
        rankingsPublished: false,
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
        rankingsPublished: z.boolean(),
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
    pendingStudents: students.filter((u) => (u.activationStatus ?? "pending") === "pending").length,
    approvedStudents: students.filter((u) => u.activationStatus === "approved").length,
    activatedStudents: students.filter((u) => u.activationStatus === "active").length,
    rejectedStudents: students.filter((u) => u.activationStatus === "rejected").length,
    suspendedStudents: students.filter((u) => u.activationStatus === "suspended").length,
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
    const profile = await requireProfile(idToken);
    const all = await fsQuery<Exam>("exams", [["status", "EQUAL", "active"]]);
    const now = Date.now();
    const opened = all.filter(
      (e) => examWindowState(e, now) === "open" || e.status === "active",
    );
    // Staff see every open exam; students only see exams for courses they are
    // actively enrolled in.
    const isStaff =
      profile.role === "owner" ||
      profile.role === "admin" ||
      profile.role === "instructor";
    if (isStaff) return opened;

    // Student filter: active enrollment per exam.courseId.
    // To keep the fn fast, batch-check only the courses present in `opened`.
    const neededCourseIds = [...new Set(opened.map((e) => e.courseId))];
    if (neededCourseIds.length === 0) return [];
    const myEnrollments = await fsQuery<Enrollment>("enrollments", [
      ["userId", "EQUAL", profile.id],
    ]);
    const active = new Set<string>();
    for (const e of myEnrollments) {
      if (
        e.status === "active" &&
        e.paymentStatus === "paid" &&
        (!e.expiresAt || e.expiresAt >= now)
      ) {
        active.add(e.courseId);
      }
    }
    // Legacy fallback: if profile.courseIds is populated and no enrollments
    // exist yet (pre-migration data), treat profile.courseIds as enrolled.
    const legacy = new Set<string>(profile.courseIds ?? []);
    return opened.filter((e) => active.has(e.courseId) || legacy.has(e.courseId));
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
    const existing = await fsGet<Profile>("users", data.id);
    if (existing) {
      // Profile already exists, just return it
      return existing;
    }

    const now = Date.now();
    const profile: Profile = {
      id: data.id,
      uid: data.id,
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      role: "student",
      courseIds: [],
      status: "active",
      activationStatus: "pending",
      createdAt: now,
      updatedAt: now,
      ...(data.phone && { phone: data.phone }),
      ...(data.department && { department: data.department }),
    };

    await fsSet("users", data.id, profile as unknown as Record<string, unknown>);
    return profile;
  });

// ---------------------------------------------------------------------------
// RANKING — get student rankings
// ---------------------------------------------------------------------------

export const getRankings = createServerFn({ method: "GET" }).handler(async () => {
  const idToken = getToken();
  const profile = await requireProfile(idToken);

  const [attempts, users, settingsDoc] = await Promise.all([
    fsList<Attempt>("examAttempts"),
    fsList<Profile>("users"),
    fsGet<AcademySettings>("settings", "academy"),
  ]);

  const submitted = attempts.filter((a) => a.status === "graded" && a.published);
  const students = users.filter((u) => u.role === "student");
  const rankingsPublished = settingsDoc?.rankingsPublished ?? false;

  const isStaff =
    profile.role === "owner" || profile.role === "admin" || profile.role === "instructor";

  // Calculate scores per student
  const studentScores = students.map((student) => {
    const studentAttempts = submitted.filter((a) => a.studentId === student.id);
    const totalScore = studentAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0);
    const avgScore =
      studentAttempts.length > 0 ? Math.round(totalScore / studentAttempts.length) : 0;
    const examCount = studentAttempts.length;
    const nickname = (student as (typeof student & { nickname?: string }))?.nickname;
    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      nickname: nickname ?? `Student${student.id.slice(-4).toUpperCase()}`,
      avgScore,
      examCount,
      totalScore,
    };
  });

  studentScores.sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
    return b.examCount - a.examCount;
  });

  const ranked = studentScores.map((s, index) => ({
    ...s,
    rank: index + 1,
  }));

  if (isStaff) {
    return {
      all: ranked,
      rankingsPublished,
      isStaff: true,
      myRank: null,
    };
  }

  const myRank = ranked.find((r) => r.id === profile.id) ?? null;

  if (rankingsPublished) {
    return {
      all: ranked.map((r) => ({
        rank: r.rank,
        nickname: r.nickname,
        avgScore: r.avgScore,
        examCount: r.examCount,
        id: r.id === profile.id ? r.id : null,
      })),
      rankingsPublished: true,
      isStaff: false,
      myRank,
    };
  }

  return {
    all: myRank
      ? [
          {
            rank: myRank.rank,
            nickname: myRank.nickname,
            avgScore: myRank.avgScore,
            examCount: myRank.examCount,
            id: myRank.id,
          },
        ]
      : [],
    rankingsPublished: false,
    isStaff: false,
    myRank,
  };
});

export const adminPublishRankings = createServerFn({ method: "POST" }).handler(async () => {
  const idToken = getToken();
  const actor = await requireStaff(idToken);

  const current = (await fsGet<AcademySettings>("settings", "academy")) ?? {
    telegramHandle: "",
    telegramUrl: "",
    announcementOm: "",
    announcementEn: "",
    contactEmail: "",
    contactPhone: "",
    rankingsPublished: false,
  };

  const updated: AcademySettings = {
    ...current,
    rankingsPublished: true,
  };

  await fsSet("settings", "academy", updated as unknown as Record<string, unknown>);
  await logAudit(actor, "rankings.publish");
  return { success: true, rankingsPublished: true };
});

export const adminUnpublishRankings = createServerFn({ method: "POST" }).handler(async () => {
  const idToken = getToken();
  const actor = await requireStaff(idToken);

  const current = (await fsGet<AcademySettings>("settings", "academy")) ?? {
    telegramHandle: "",
    telegramUrl: "",
    announcementOm: "",
    announcementEn: "",
    contactEmail: "",
    contactPhone: "",
    rankingsPublished: false,
  };

  const updated: AcademySettings = {
    ...current,
    rankingsPublished: false,
  };

  await fsSet("settings", "academy", updated as unknown as Record<string, unknown>);
  await logAudit(actor, "rankings.unpublish");
  return { success: true, rankingsPublished: false };
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
      throw new AppError("ai/not-configured");
    }

    // Dynamic import keeps ai-import.server.ts out of the client bundle
    try {
      const { aiExtractQuestions } = await import("./ai-import.server");
      return await aiExtractQuestions(data.text, apiKey);
    } catch (err) {
      // Re-wrap so TanStack Start forwards the real message to the client
      // instead of swallowing it as a generic "Error".
      const msg = err instanceof Error ? err.message : String(err);
      // Truncate to stay within serverErrorMessage's 220-char passthrough limit
      throw new AppError(msg.slice(0, 200));
    }
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

// ===========================================================================
// ACTIVATION CODES + ENROLLMENTS
// ===========================================================================

// ---------- code generation helpers ----------

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function randomSegment(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length]!;
  return out;
}

/** Generate one activation code in the form `OA-XXXX-XXXX`. */
export function generateRawCode(): string {
  return `OA-${randomSegment(4)}-${randomSegment(4)}`;
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

/**
 * Find an activation code by raw user input.
 * Hashes the normalized input and queries the activationCodes collection.
 */
async function findCodeByRaw(raw: string): Promise<ActivationCode | null> {
  const norm = normalizeCode(raw);
  if (!norm) return null;
  const hash = await sha256Hex(norm);
  const matches = await fsQuery<ActivationCode>("activationCodes", [
    ["codeHash", "EQUAL", hash],
  ]);
  if (matches.length === 0) return null;
  return matches[0]!;
}

/**
 * Upsert enrollment: activate (or re-activate) `userId` in `courseId` and mark
 * it paid. Used both during code redemption and for admin manual activation.
 * Returns the enrollment id.
 */
async function activateEnrollment(
  userId: string,
  courseId: string,
  {
    activatedByCodeId,
    expiresAt,
  }: { activatedByCodeId: string | null; expiresAt: number | null },
): Promise<string> {
  const now = Date.now();
  const existing = await fsQuery<Enrollment>("enrollments", [
    ["userId", "EQUAL", userId],
    ["courseId", "EQUAL", courseId],
  ]);
  const base: Record<string, unknown> = {
    userId,
    courseId,
    status: "active" as EnrollmentStatus,
    paymentStatus: "paid" as PaymentStatus,
    activatedByCodeId,
    enrolledAt: now,
    expiresAt,
    updatedAt: now,
  };
  if (existing[0]) {
    const id = existing[0].id;
    await fsSet("enrollments", id, base);
    return id;
  }
  const id = await fsCreate("enrollments", {
    ...base,
    createdAt: now,
  });
  return id;
}

// ---------- admin: generate N codes ----------

export const generateActivationCodes = createServerFn({ method: "POST" })
  .validator(
    z.object({
      count: z.number().int().min(1).max(500),
      courseId: z.string().nullable().optional(),
      assignedUserId: z.string().nullable().optional(),
      expiresAt: z.number().nullable().optional(),
      note: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<ActivationCodeAdminView[]> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const now = Date.now();
    const out: ActivationCodeAdminView[] = [];
    const n = Math.max(1, Math.min(500, Math.floor(data.count)));
    for (let i = 0; i < n; i++) {
      const raw = generateRawCode();
      const hash = await sha256Hex(raw);
      const codeLast4 = raw.slice(-4);
      const record: ActivationCode = {
        id: crypto.randomUUID(),
        codeHash: hash,
        codeLast4,
        status: "available",
        assignedUserId: data.assignedUserId ?? null,
        courseId: data.courseId ?? null,
        createdBy: actor.id,
        createdAt: now,
        expiresAt: data.expiresAt ?? null,
        usedAt: null,
        usedByUserId: null,
        revokedAt: null,
        revokedByUserId: null,
        ...(data.note ? { note: data.note } : {}),
      };
      await fsCreate("activationCodes", record as unknown as Record<string, unknown>);
      out.push({ ...record, rawCode: raw });
    }
    await logAudit(
      actor,
      "activationCodes.generate",
      undefined,
      `Generated ${n} code(s)${data.courseId ? ` for course ${data.courseId}` : ""}${
        data.assignedUserId ? ` assigned to ${data.assignedUserId}` : ""
      }`,
    );
    return out;
  });

// ---------- student: redeem activation code ----------

export const redeemActivationCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string().min(6).max(64),
    }),
  )
  .handler(
    async ({
      data,
    }): Promise<{
      ok: true;
      activationStatus: ActivationStatus;
      courseId: string | null;
    }> => {
      const idToken = getToken();
      const profile = await requireProfile(idToken);

      // 1. Already activated? Succeed immediately (don't consume another code).
      if (profile.activationStatus === "active") {
        // If they pasted a code anyway, don't consume it or break anything.
        return { ok: true, activationStatus: "active", courseId: null };
      }
      // 2. Suspended/expired/rejected accounts cannot redeem codes.
      if (
        profile.activationStatus === "suspended" ||
        profile.activationStatus === "expired" ||
        profile.activationStatus === "rejected"
      ) {
        throw new AppError("activation/account-locked");
      }
      // 3. Pending students (not yet approved) cannot redeem codes yet.
      if (profile.activationStatus === "pending") {
        throw new AppError("activation/not-approved");
      }

      // 3. Locate the code (by hash) — do NOT expose hash to browser.
      const code = await findCodeByRaw(data.code);
      if (!code) throw new AppError("activation/invalid-code");

      const now = Date.now();

      // 4. Status checks: used, revoked, expired, assigned-user.
      if (code.status === "used") throw new AppError("activation/code-used");
      if (code.status === "revoked") throw new AppError("activation/code-revoked");
      if (code.expiresAt && code.expiresAt < now) throw new AppError("activation/code-expired");
      if (code.assignedUserId && code.assignedUserId !== profile.id)
        throw new AppError("activation/code-wrong-user");

      // 5. Atomic-ish write: mark code used + update profile activation + create
      //    enrollment. If a second call races in, the status transition from
      //    "available" will reject the second redemption below.
      //
      // Re-read the code document via fsGet right before writing to detect any
      // concurrent change since we queried it via fsQuery.
      const fresh = await fsGet<ActivationCode>("activationCodes", code.id);
      if (!fresh || fresh.status !== "available") {
        throw new AppError("activation/code-used");
      }

      // Transition code status -> used
      const updatedCode: ActivationCode = {
        ...fresh,
        status: "used",
        usedAt: now,
        usedByUserId: profile.id,
      };
      await fsSet(
        "activationCodes",
        fresh.id,
        updatedCode as unknown as Record<string, unknown>,
      );

      // Transition profile -> active
      const profilePatch: Record<string, unknown> = {
        activationStatus: "active" as ActivationStatus,
        activatedAt: now,
        activationCodeId: fresh.id,
        updatedAt: now,
      };
      // If the code is assigned to a course, record it as an enrolled course id
      // for backwards compatibility with the older courseIds[] based UI.
      const activatedCourseId = fresh.courseId;
      if (activatedCourseId) {
        const union = new Set<string>([...(profile.courseIds ?? []), activatedCourseId]);
        profilePatch["courseIds"] = [...union];
      }
      await fsSet("users", profile.id, profilePatch);

      // Activate enrollment for the linked course (if any)
      let enrollmentId: string | null = null;
      if (activatedCourseId) {
        enrollmentId = await activateEnrollment(profile.id, activatedCourseId, {
          activatedByCodeId: fresh.id,
          expiresAt: fresh.expiresAt,
        });
      }

      await logAudit(
        profile,
        "activation.redeemed",
        activatedCourseId ?? undefined,
        `code=${fresh.codeLast4}${enrollmentId ? ` enrollment=${enrollmentId}` : ""}`,
      );

      return {
        ok: true,
        activationStatus: "active",
        courseId: activatedCourseId,
      };
    },
  );

// ---------- admin: list activation codes ----------

export const adminListActivationCodes = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        status: z.enum(["all", "available", "used", "expired", "revoked"]).optional(),
        courseId: z.string().nullable().optional(),
        searchLast4: z.string().nullable().optional(),
        assignedUserId: z.string().nullable().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }): Promise<ActivationCodeAdminView[]> => {
    const idToken = getToken();
    await requireStaff(idToken);
    const all = await fsList<ActivationCode>("activationCodes");
    const users = await fsList<Profile>("users");
    const courses = await fsList<Course>("courses");
    const userById = new Map(users.map((u) => [u.id, u]));
    const courseById = new Map(courses.map((c) => [c.id, c]));
    const filt = data ?? {};
    const out: ActivationCodeAdminView[] = [];
    for (const c of all) {
      if (filt.status && filt.status !== "all" && c.status !== filt.status) continue;
      if (filt.courseId && c.courseId !== filt.courseId) continue;
      if (filt.assignedUserId && c.assignedUserId !== filt.assignedUserId) continue;
      if (filt.searchLast4 && !c.codeLast4.includes(filt.searchLast4.toUpperCase()))
        continue;
      const usedBy = c.usedByUserId ? userById.get(c.usedByUserId) : undefined;
      const assigned = c.assignedUserId ? userById.get(c.assignedUserId) : undefined;
      const course = c.courseId ? courseById.get(c.courseId) : undefined;
      out.push({
        ...c,
        usedByUserName: usedBy ? usedBy.fullName : undefined,
        assignedUserName: assigned ? assigned.fullName : undefined,
        courseTitleOm: course?.titleOm,
        courseTitleEn: course?.titleEn,
      });
    }
    out.sort((a, b) => b.createdAt - a.createdAt);
    return out;
  });

// ---------- admin: revoke code ----------

export const adminRevokeActivationCode = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const existing = await fsGet<ActivationCode>("activationCodes", data.id);
    if (!existing) throw new AppError("activation/not-found");
    if (existing.status === "used") throw new AppError("activation/code-used");
    const now = Date.now();
    await fsSet("activationCodes", data.id, {
      status: "revoked" as const,
      revokedAt: now,
      revokedByUserId: actor.id,
      updatedAt: now,
    });
    await logAudit(actor, "activationCodes.revoke", data.id);
  });

// ---------- admin: manually activate a student + optional course enrollments ----------

export const adminManualActivateStudent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      courseIds: z.array(z.string()).optional(),
      expiresAt: z.number().nullable().optional(),
      note: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const target = await fsGet<Profile>("users", data.userId);
    if (!target) throw new AppError("auth/user-not-found");
    const now = Date.now();

    // Flip activation status to active
    const profilePatch: Record<string, unknown> = {
      activationStatus: "active" as ActivationStatus,
      status: "active" as const,
      activatedAt: target.activatedAt ?? now,
      updatedAt: now,
    };
    if (data.courseIds && data.courseIds.length > 0) {
      const union = new Set<string>([...(target.courseIds ?? []), ...data.courseIds]);
      profilePatch["courseIds"] = [...union];
    }
    await fsSet("users", target.id, profilePatch);

    // Create/activate enrollment for each requested course
    if (data.courseIds && data.courseIds.length > 0) {
      for (const courseId of data.courseIds) {
        await activateEnrollment(target.id, courseId, {
          activatedByCodeId: null,
          expiresAt: data.expiresAt ?? null,
        });
      }
    }

    await logAudit(
      actor,
      "activation.adminActivate",
      target.id,
      [
        `courses=${(data.courseIds ?? []).join(",") || "none"}`,
        data.note ? `note=${data.note}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  });

// ---------- admin: set activation status manually (suspend/reactivate/expire) ----------

export const adminSetActivationStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      activationStatus: z.enum(["pending", "active", "suspended", "expired"]),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const target = await fsGet<Profile>("users", data.userId);
    if (!target) throw new AppError("auth/user-not-found");
    const now = Date.now();
    await fsSet("users", target.id, {
      activationStatus: data.activationStatus,
      updatedAt: now,
    });
    await logAudit(
      actor,
      `activation.setStatus.${data.activationStatus}`,
      target.id,
    );
  });

// ---------- student: get own enrollments ----------

export const getMyEnrollments = createServerFn({ method: "GET" }).handler(
  async (): Promise<Enrollment[]> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);
    const all = await fsQuery<Enrollment>("enrollments", [
      ["userId", "EQUAL", profile.id],
    ]);
    const now = Date.now();
    // Mark any lapsed enrollments as expired (best effort)
    for (const e of all) {
      if (e.status === "active" && e.expiresAt && e.expiresAt < now) {
        e.status = "expired";
        void fsSet("enrollments", e.id, { status: "expired", updatedAt: now }).catch(
          () => undefined,
        );
      }
    }
    return all;
  },
);

// ===========================================================================
// PROTECT availableExams + startExam USING ENROLLMENTS
// ===========================================================================

/**
 * Return true if `profile` has an active, paid, non-expired enrollment for
 * `courseId`. Staff users are treated as enrolled in every course.
 */
async function hasActiveEnrollment(
  profile: Profile,
  courseId: string | null | undefined,
): Promise<boolean> {
  const isStaff =
    profile.role === "owner" || profile.role === "admin" || profile.role === "instructor";
  if (isStaff) return true;
  if (!courseId) return true; // no course restriction specified

  const list = await fsQuery<Enrollment>("enrollments", [
    ["userId", "EQUAL", profile.id],
    ["courseId", "EQUAL", courseId],
  ]);
  const now = Date.now();
  return list.some(
    (e) =>
      e.status === "active" &&
      e.paymentStatus === "paid" &&
      (!e.expiresAt || e.expiresAt >= now),
  );
}


// ===========================================================================
// ADMIN APPROVAL FLOW
// ===========================================================================

/**
 * adminApproveStudent
 *
 * 1. Verifies the requester is admin/owner.
 * 2. Generates a unique activation code assigned exclusively to this student.
 * 3. Sets activationStatus = "approved" on the profile.
 * 4. Records approvedBy + approvedAt.
 * 5. The raw code is NOT returned here — the student sees it on their page
 *    via getMyPendingCode, which is guarded to their own UID.
 */
export const adminApproveStudent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const target = await fsGet<Profile>("users", data.userId);
    if (!target) throw new AppError("auth/user-not-found");

    const now = Date.now();

    // If already approved/active, just log and return (idempotent)
    if (target.activationStatus === "active") {
      await logAudit(actor, "student.approveSkipped", target.id, "already active");
      return;
    }

    // If there is already an assigned code (idempotent re-approval), re-use it.
    // Otherwise generate a fresh one.
    let codeId = target.assignedActivationCodeId ?? null;
    let rawCode: string | null = null;

    if (!codeId) {
      // Generate unique code
      rawCode = generateRawCode();
      const hash = await sha256Hex(rawCode);
      const codeLast4 = rawCode.slice(-4);

      const codeRecord: ActivationCode = {
        id: crypto.randomUUID(),
        codeHash: hash,
        codeLast4,
        status: "available",
        assignedUserId: target.id,
        courseId: null,
        createdBy: actor.id,
        createdAt: now,
        expiresAt: null,
        usedAt: null,
        usedByUserId: null,
        revokedAt: null,
        revokedByUserId: null,
        note: `Auto-generated on approval for ${target.email}`,
      };

      codeId = await fsCreate(
        "activationCodes",
        codeRecord as unknown as Record<string, unknown>,
      );

      // Store the raw code in a restricted sub-collection so only the
      // owner and the assigned student's server call can retrieve it.
      // We put it in activationCodeSecrets/{codeId} — staff-only read.
      await fsSet("activationCodeSecrets", codeId, {
        rawCode,
        userId: target.id,
        createdAt: now,
      });
    }

    // Update student profile
    await fsSet("users", target.id, {
      activationStatus: "approved" as ActivationStatus,
      assignedActivationCodeId: codeId,
      approvedBy: actor.id,
      approvedAt: now,
      // Clear any prior rejection
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: now,
    });

    await logAudit(actor, "student.approved", target.id, target.email);
  });

/**
 * adminRejectStudent — sets activationStatus = "rejected" with optional reason.
 */
export const adminRejectStudent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const target = await fsGet<Profile>("users", data.userId);
    if (!target) throw new AppError("auth/user-not-found");

    const now = Date.now();
    await fsSet("users", target.id, {
      activationStatus: "rejected" as ActivationStatus,
      rejectedBy: actor.id,
      rejectedAt: now,
      rejectionReason: data.reason ?? null,
      updatedAt: now,
    });

    await logAudit(actor, "student.rejected", target.id, data.reason ?? target.email);
  });

/**
 * adminReApproveStudent — re-approves a previously rejected student.
 * Reuses the same approval flow.
 */
export const adminReApproveStudent = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }): Promise<void> => {
    // Delegate to the approve function — it is already idempotent.
    // We need to call it via the same token, so we re-implement inline:
    const idToken = getToken();
    const actor = await requireAdmin(idToken);
    const target = await fsGet<Profile>("users", data.userId);
    if (!target) throw new AppError("auth/user-not-found");

    const now = Date.now();

    let codeId = target.assignedActivationCodeId ?? null;

    if (!codeId) {
      const rawCode = generateRawCode();
      const hash = await sha256Hex(rawCode);
      const codeLast4 = rawCode.slice(-4);
      const codeRecord: ActivationCode = {
        id: crypto.randomUUID(),
        codeHash: hash,
        codeLast4,
        status: "available",
        assignedUserId: target.id,
        courseId: null,
        createdBy: actor.id,
        createdAt: now,
        expiresAt: null,
        usedAt: null,
        usedByUserId: null,
        revokedAt: null,
        revokedByUserId: null,
        note: `Re-approval code for ${target.email}`,
      };
      codeId = await fsCreate(
        "activationCodes",
        codeRecord as unknown as Record<string, unknown>,
      );
      await fsSet("activationCodeSecrets", codeId, {
        rawCode,
        userId: target.id,
        createdAt: now,
      });
    }

    await fsSet("users", target.id, {
      activationStatus: "approved" as ActivationStatus,
      assignedActivationCodeId: codeId,
      approvedBy: actor.id,
      approvedAt: now,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      updatedAt: now,
    });

    await logAudit(actor, "student.reApproved", target.id, target.email);
  });

/**
 * getMyPendingCode — called by the student on the waiting page.
 *
 * Returns the raw activation code ONLY when:
 *   - The caller is authenticated.
 *   - The caller's profile activationStatus is "approved".
 *   - The code is assigned to the caller's UID.
 *
 * Returns null otherwise (pending / rejected / active states).
 */
export const getMyPendingCode = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ code: string | null; status: ActivationStatus }> => {
    const idToken = getToken();
    const profile = await requireProfile(idToken);

    const status = profile.activationStatus ?? "pending";

    if (status !== "approved") {
      return { code: null, status };
    }

    const codeId = profile.assignedActivationCodeId;
    if (!codeId) return { code: null, status };

    // Read the secret record
    const secret = await fsGet<{ rawCode: string; userId: string }>(
      "activationCodeSecrets",
      codeId,
    );
    if (!secret || secret.userId !== profile.id) return { code: null, status };

    return { code: secret.rawCode, status };
  },
);

/**
 * adminListPendingStudents — list all students with activationStatus = "pending"
 * sorted by newest first.
 */
export const adminListPendingStudents = createServerFn({ method: "GET" }).handler(
  async (): Promise<Profile[]> => {
    const idToken = getToken();
    await requireAdmin(idToken);
    const all = await fsList<Profile>("users");
    return all
      .filter((u) => u.role === "student")
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
);
