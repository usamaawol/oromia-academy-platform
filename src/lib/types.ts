export type Role = "owner" | "instructor" | "student";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  enrolledCourseIds: string[];
  progress?: Record<string, number>;
  createdAt?: number;
};

export type Course = {
  id: string;
  titleOm: string;
  titleEn: string;
  descOm: string;
  descEn: string;
  icon: string;
  level: "easy" | "medium" | "hard";
  status: "active" | "draft" | "archived";
  instructor?: string;
  lessons?: number;
  order?: number;
  createdAt?: number;
};

export type QuestionType = "mcq" | "truefalse" | "short" | "essay";
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionOption = { id: string; text: string };

export type Question = {
  id: string;
  courseId: string;
  topic: string;
  type: QuestionType;
  language: "om" | "en" | "both";
  difficulty: Difficulty;
  text: string;
  textEn?: string;
  options: QuestionOption[];
  correctOptionId?: string;
  correctBool?: boolean;
  expectedAnswer?: string;
  rubric?: string;
  points: number;
  tags: string[];
  approved: boolean;
  source: "manual" | "ai" | "pdf";
  createdAt?: number;
};

export type ExamStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "closed"
  | "resultsPending"
  | "resultsPublished"
  | "archived";

export type Exam = {
  id: string;
  title: string;
  courseId: string;
  topic?: string;
  description?: string;
  instructions?: string;
  language: "om" | "en" | "both";
  instructor?: string;
  startAt: number | null;
  endAt: number | null;
  durationMin: number;
  maxAttempts: number; // 0 = unlimited
  password: string;
  passMark: number;
  questionIds: string[];
  poolSize: number; // 0 = use all
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowBackward: boolean;
  oneAtATime: boolean;
  requireFullscreen: boolean;
  trackTabs: boolean;
  resultPolicy: "immediate" | "manual" | "scheduled";
  resultsPublishAt?: number | null;
  resultsPublished: boolean;
  showAnswersAfter: boolean;
  status: ExamStatus;
  createdAt?: number;
};

export type PresentedQuestion = {
  questionId: string;
  optionOrder: string[];
};

export type AttemptEvent = { type: "tab" | "fullscreen" | "offline" | "online"; at: number };

export type Attempt = {
  id: string;
  examId: string;
  examTitle: string;
  courseId: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: number;
  serverStartedAt?: number;
  expiresAt: number;
  submittedAt?: number;
  presented: PresentedQuestion[];
  answers: Record<string, string>;
  status: "in_progress" | "submitted" | "graded";
  autoScore: number;
  manualScore: number;
  totalPoints: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  passed: boolean;
  needsManualGrading: boolean;
  feedback?: string;
  manualGrades?: Record<string, { points: number; feedback?: string }>;
  events: AttemptEvent[];
  published: boolean;
};

export type AppNotification = {
  id: string;
  userId: string | "all";
  titleOm: string;
  titleEn: string;
  bodyOm?: string;
  bodyEn?: string;
  createdAt: number;
  read?: boolean;
};

export type AuditEntry = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target?: string;
  before?: string;
  after?: string;
  createdAt: number;
};

export type AcademySettings = {
  telegramHandle: string;
  telegramUrl: string;
  heroTitleOm: string;
  heroTitleEn: string;
  heroSubtitleOm: string;
  heroSubtitleEn: string;
  announcementOm: string;
  announcementEn: string;
  contactEmail: string;
  contactPhone: string;
};

export const DEFAULT_SETTINGS: AcademySettings = {
  telegramHandle: "@SuufiyaanBJICS",
  telegramUrl: "https://t.me/SuufiyaanBJICS",
  heroTitleOm: "",
  heroTitleEn: "",
  heroSubtitleOm: "",
  heroSubtitleEn: "",
  announcementOm: "",
  announcementEn: "",
  contactEmail: "",
  contactPhone: "",
};

export const OWNER_EMAIL = "usamaawol0@gmail.com";
