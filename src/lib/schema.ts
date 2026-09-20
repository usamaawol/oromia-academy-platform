/**
 * Authoritative data shapes shared by the trusted server and the browser.
 *
 * IMPORTANT: `Question` (with its answer key) is server-only data. Browsers
 * only ever receive `PublicQuestion`.
 */

export type Role = "owner" | "admin" | "instructor" | "student";

export const STAFF_ROLES: Role[] = ["owner", "admin", "instructor"];
export const ADMIN_ROLES: Role[] = ["owner", "admin"];

export type Profile = {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  nickname?: string; // anonymous display name for leaderboards
  role: Role;
  courseIds: string[];
  status: "active" | "suspended";
  createdAt: number;
  updatedAt: number;
};

export type Course = {
  id: string;
  titleOm: string;
  titleEn: string;
  descOm: string;
  descEn: string;
  icon?: string;
  level: "easy" | "medium" | "hard";
  status: "active" | "draft" | "archived";
  order?: number;
  createdAt?: number;
};

export type QuestionType = "mcq" | "truefalse" | "short" | "essay";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionLanguage = "om" | "en" | "both";

export type QuestionOption = { id: string; textOm: string; textEn?: string };

/** Server-side question record — contains the answer key. Never sent to students. */
export type Question = {
  id: string;
  courseId: string;
  topic: string;
  type: QuestionType;
  language: QuestionLanguage;
  difficulty: Difficulty;
  textOm: string;
  textEn?: string;
  options: QuestionOption[];
  correctOptionId?: string;
  correctBool?: boolean;
  expectedAnswer?: string;
  rubric?: string;
  points: number;
  tags: string[];
  approved: boolean;
  createdAt?: number;
  updatedAt?: number;
};

/** Exactly what a student's browser is allowed to see about a question. */
export type PublicQuestion = {
  questionId: string;
  type: QuestionType;
  points: number;
  textOm: string;
  textEn?: string;
  options: QuestionOption[];
};

export type ExamStatus = "draft" | "active" | "closed" | "archived";
export type ResultPolicy = "immediate" | "manual" | "scheduled";

export type Exam = {
  id: string;
  title: string;
  courseId: string;
  topic?: string;
  description?: string;
  instructions?: string;
  language: QuestionLanguage;
  startAt: number | null;
  endAt: number | null;
  durationMin: number;
  maxAttempts: number; // 0 = unlimited
  passMark: number;
  questionIds: string[];
  poolSize: number; // 0 = use every selected question
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowBackward: boolean;
  requireFullscreen: boolean;
  resultPolicy: ResultPolicy;
  resultsPublishAt: number | null;
  status: ExamStatus;
  hasPassword?: boolean;
  showAnswersAfter?: boolean; // show correct/wrong after result published
  anonymous?: boolean;       // show leaderboard with nicknames only
  pdfUrl?: string | undefined; // uploaded exam paper PDF URL (data URL or storage URL)
  pdfName?: string | undefined; // original filename of the uploaded PDF
  createdAt?: number;
  updatedAt?: number;
};

export type AttemptStatus = "in_progress" | "submitted" | "graded";

export type PresentedQuestion = {
  questionId: string;
  optionOrder: string[];
};

export type Attempt = {
  id: string;
  examId: string;
  examTitle: string;
  courseId: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  status: AttemptStatus;
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
  answers: Record<string, string>;
  startedAt: number;
  expiresAt: number;
  submittedAt: number | null;
  autoScore: number;
  manualScore: number;
  totalPoints: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  passed: boolean;
  needsManualGrading: boolean;
  manualGrades?: Record<string, { points: number; feedback?: string }>;
  feedback?: string;
  published: boolean;
  publishedAt?: number | null;
  gradedAt?: number | null;
  // per-question breakdown, set on submit (server-only, stripped before publish)
  questionResults?: Record<string, "correct" | "wrong" | "partial" | "unanswered">;
};

/** The live exam payload a student receives — no answer keys, ever. */
export type AttemptView = {
  attempt: {
    id: string;
    examId: string;
    examTitle: string;
    status: AttemptStatus;
    startedAt: number;
    expiresAt: number;
    submittedAt: number | null;
    answers: Record<string, string>;
    allowBackward: boolean;
    requireFullscreen: boolean;
    language: QuestionLanguage;
  };
  questions: PublicQuestion[];
  serverNow: number;
};

export type ResultView = {
  attemptId: string;
  examId: string;
  examTitle: string;
  submittedAt: number | null;
  totalPoints: number;
  score: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  needsManualGrading: boolean;
  feedback?: string;
  // per-question review (only if exam.showAnswersAfter is true)
  questionReview?: Array<{
    questionId: string;
    textOm: string;
    textEn?: string;
    type: string;
    yourAnswer: string;
    correctAnswer: string;
    result: "correct" | "wrong" | "partial" | "unanswered";
    points: number;
    earned: number;
    options: Array<{ id: string; textOm: string; textEn?: string }>;
  }>;
};

export type AppNotification = {
  id: string;
  userId: string | "all";
  titleOm: string;
  titleEn: string;
  bodyOm?: string;
  bodyEn?: string;
  createdAt: number;
};

export type AuditEntry = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  details?: string;
  createdAt: number;
};

export type AcademySettings = {
  telegramHandle: string;
  telegramUrl: string;
  announcementOm: string;
  announcementEn: string;
  contactEmail: string;
  contactPhone: string;
  rankingsPublished: boolean;
};

export const DEFAULT_SETTINGS: AcademySettings = {
  telegramHandle: "@SuufiyaanBJICS",
  telegramUrl: "https://t.me/SuufiyaanBJICS",
  announcementOm: "",
  announcementEn: "",
  contactEmail: "",
  contactPhone: "",
  rankingsPublished: false,
};
