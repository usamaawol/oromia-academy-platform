/**
 * Offline / demo data layer.
 * Used when Firebase credentials are not configured so the whole app stays
 * usable and visible. Data persists in localStorage per browser.
 */
import {
  DEFAULT_SETTINGS,
  type AcademySettings,
  type Attempt,
  type AuditEntry,
  type Course,
  type Exam,
  type AppNotification,
  type Question,
  type UserProfile,
  type ActivationCode,
  type Enrollment,
} from "./types";

const KEY = "oa.localdb.v2";

export type LocalDb = {
  users: UserProfile[];
  courses: Course[];
  questions: Question[];
  exams: Exam[];
  attempts: Attempt[];
  notifications: AppNotification[];
  audit: AuditEntry[];
  settings: AcademySettings;
  activationCodes: ActivationCode[];
  enrollments: Enrollment[];
};

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

const now = Date.now();

const courses: Course[] = [
  {
    id: "c_ai",
    titleOm: "Gulaallii AI (AI Editing)",
    titleEn: "AI Editing",
    descOm: "Suuraa, sagalee fi viidiyoo meeshaalee AI'tiin gulaaluu.",
    descEn: "Edit images, audio and video using modern AI tools.",
    icon: "sparkles",
    level: "easy",
    status: "active",
    instructor: "Usama Awol",
    lessons: 12,
    order: 1,
    createdAt: now,
  },
  {
    id: "c_tg",
    titleOm: "Telegram irraa Galii Argachuu",
    titleEn: "Telegram Earning",
    descOm: "Karaa Telegram hojii fi galii dhugaa uumuu.",
    descEn: "Build real income streams with Telegram channels and services.",
    icon: "send",
    level: "medium",
    status: "active",
    instructor: "Usama Awol",
    lessons: 9,
    order: 2,
    createdAt: now,
  },
  {
    id: "c_bot",
    titleOm: "Bot Automation",
    titleEn: "Bot Automation",
    descOm: "Bot ofumaan hojjetu ijaaruu fi bulchuu.",
    descEn: "Design, build and operate automation bots.",
    icon: "bot",
    level: "hard",
    status: "active",
    instructor: "Usama Awol",
    lessons: 14,
    order: 3,
    createdAt: now,
  },
];

function mcq(
  id: string,
  courseId: string,
  topic: string,
  text: string,
  textEn: string,
  opts: string[],
  correctIdx: number,
): Question {
  return {
    id,
    courseId,
    topic,
    type: "mcq",
    language: "both",
    difficulty: "easy",
    text,
    textEn,
    options: opts.map((o, i) => ({ id: `o${i + 1}`, text: o })),
    correctOptionId: `o${correctIdx + 1}`,
    points: 1,
    tags: [topic],
    approved: true,
    source: "manual",
    createdAt: now,
  };
}

const questions: Question[] = [
  mcq(
    "q1",
    "c_ai",
    "Bu'uura",
    "AI jechuun maal jechuudha?",
    "What does AI stand for?",
    ["Artificial Intelligence", "Automatic Internet", "Applied Image", "Audio Input"],
    0,
  ),
  mcq(
    "q2",
    "c_ai",
    "Meeshaalee",
    "Meeshaan kam suuraa uumuuf oola?",
    "Which tool is used to generate images?",
    ["Midjourney", "Excel", "Notepad", "WinRAR"],
    0,
  ),
  {
    id: "q3",
    courseId: "c_ai",
    topic: "Bu'uura",
    type: "truefalse",
    language: "both",
    difficulty: "easy",
    text: "AI suuraa haaraa uumuu danda'a.",
    textEn: "AI can generate brand new images.",
    options: [],
    correctBool: true,
    points: 1,
    tags: ["basics"],
    approved: true,
    source: "manual",
    createdAt: now,
  },
  mcq(
    "q4",
    "c_tg",
    "Telegram",
    "Chaanaalii Telegram irratti galii argachuuf karaa filatamaan kami?",
    "What is a common way to earn on Telegram?",
    ["Beeksisa gurguruu", "Bilbila cufuu", "Faayila haquu", "Interneetii dhaamsuu"],
    0,
  ),
  {
    id: "q5",
    courseId: "c_tg",
    topic: "Telegram",
    type: "short",
    language: "both",
    difficulty: "medium",
    text: "Chaanaalii kee guddisuuf tooftaa tokko barreessi.",
    textEn: "Write one strategy to grow your channel.",
    options: [],
    expectedAnswer: "Consistent content, collaborations, SEO-friendly names.",
    rubric: "Any reasonable growth tactic earns full points.",
    points: 2,
    tags: ["growth"],
    approved: true,
    source: "manual",
    createdAt: now,
  },
  mcq(
    "q6",
    "c_bot",
    "Automation",
    "Bot Telegram ijaaruuf token eessaa argatta?",
    "Where do you get a Telegram bot token?",
    ["@BotFather", "@Support", "Google Drive", "Play Store"],
    0,
  ),
  {
    id: "q7",
    courseId: "c_bot",
    topic: "Automation",
    type: "truefalse",
    language: "both",
    difficulty: "medium",
    text: "Webhook bot dhaaf dhaamsa fida.",
    textEn: "A webhook delivers messages to a bot.",
    options: [],
    correctBool: true,
    points: 1,
    tags: ["webhook"],
    approved: true,
    source: "manual",
    createdAt: now,
  },
];

const exams: Exam[] = [
  {
    id: "e_ai1",
    title: "AI Editing — Qormaata Bu'uuraa",
    courseId: "c_ai",
    topic: "Bu'uura",
    description: "Qormaata bu'uuraa AI Editing.",
    instructions: "Gaaffii hunda deebisi. Yeroon daangeffameera.",
    language: "both",
    instructor: "Usama Awol",
    startAt: null,
    endAt: null,
    durationMin: 15,
    maxAttempts: 2,
    password: "1234",
    passMark: 50,
    questionIds: ["q1", "q2", "q3"],
    poolSize: 0,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowBackward: true,
    oneAtATime: false,
    requireFullscreen: false,
    trackTabs: true,
    resultPolicy: "immediate",
    resultsPublished: true,
    showAnswersAfter: true,
    status: "active",
    createdAt: now,
  },
  {
    id: "e_tg1",
    title: "Telegram Earning — Qormaata 1",
    courseId: "c_tg",
    topic: "Telegram",
    description: "Telegram irraa galii argachuu.",
    instructions: "Deebii gabaabaa ifa ta'e barreessi.",
    language: "both",
    instructor: "Usama Awol",
    startAt: null,
    endAt: null,
    durationMin: 20,
    maxAttempts: 1,
    password: "tg2026",
    passMark: 60,
    questionIds: ["q4", "q5"],
    poolSize: 0,
    shuffleQuestions: false,
    shuffleOptions: true,
    allowBackward: true,
    oneAtATime: false,
    requireFullscreen: false,
    trackTabs: true,
    resultPolicy: "manual",
    resultsPublished: false,
    showAnswersAfter: false,
    status: "active",
    createdAt: now,
  },
  {
    id: "e_bot1",
    title: "Bot Automation — Qormaata 1",
    courseId: "c_bot",
    topic: "Automation",
    description: "Bot ijaaruu fi bulchuu.",
    instructions: "Yeroo kee sirriitti fayyadami.",
    language: "both",
    instructor: "Usama Awol",
    startAt: null,
    endAt: null,
    durationMin: 25,
    maxAttempts: 0,
    password: "bot2026",
    passMark: 50,
    questionIds: ["q6", "q7"],
    poolSize: 0,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowBackward: false,
    oneAtATime: true,
    requireFullscreen: false,
    trackTabs: true,
    resultPolicy: "immediate",
    resultsPublished: true,
    showAnswersAfter: true,
    status: "active",
    createdAt: now,
  },
];

function seed(): LocalDb {
  return {
    users: [],
    courses,
    questions,
    exams,
    attempts: [],
    notifications: [
      {
        id: "n1",
        userId: "all",
        titleOm: "Baga nagaan dhuftan!",
        titleEn: "Welcome to Oromia Academy!",
        bodyOm: "Qormaata jalqabuuf gara daashboordii deemi.",
        bodyEn: "Head to your dashboard to start an exam.",
        createdAt: now,
      },
    ],
    audit: [],
    settings: DEFAULT_SETTINGS,
    activationCodes: [],
    enrollments: [],
  };
}

let cache: LocalDb | null = null;

export function readDb(): LocalDb {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = seed();
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...seed(), ...(JSON.parse(raw) as LocalDb) } : seed();
  } catch {
    cache = seed();
  }
  return cache;
}

export function writeDb(next: LocalDb): void {
  cache = next;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function mutate(fn: (db: LocalDb) => void): LocalDb {
  const db = { ...readDb() };
  fn(db);
  writeDb(db);
  return db;
}
