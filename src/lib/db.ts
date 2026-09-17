import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
  Timestamp,
  addDoc,
  limit,
} from "firebase/firestore";

import { getDb } from "./firebase";
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
} from "./types";

export const col = {
  users: () => collection(getDb(), "users"),
  courses: () => collection(getDb(), "courses"),
  questions: () => collection(getDb(), "questions"),
  exams: () => collection(getDb(), "exams"),
  attempts: () => collection(getDb(), "examAttempts"),
  notifications: () => collection(getDb(), "notifications"),
  auditLogs: () => collection(getDb(), "auditLogs"),
  settings: () => collection(getDb(), "settings"),
};

function withId<T>(id: string, data: unknown): T {
  return { id, ...(data as object) } as T;
}

/* ---------------- users ---------------- */

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(col.users(), uid));
  return snap.exists() ? withId<UserProfile>(snap.id, snap.data()) : null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const { id, ...rest } = profile;
  await setDoc(doc(col.users(), id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(col.users());
  return snap.docs.map((d) => withId<UserProfile>(d.id, d.data()));
}

export async function deleteUserProfile(id: string): Promise<void> {
  await deleteDoc(doc(col.users(), id));
}

/* ---------------- courses ---------------- */

export async function listCourses(): Promise<Course[]> {
  const snap = await getDocs(col.courses());
  return snap.docs
    .map((d) => withId<Course>(d.id, d.data()))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function saveCourse(course: Course): Promise<void> {
  const { id, ...rest } = course;
  await setDoc(doc(col.courses(), id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteDoc(doc(col.courses(), id));
}

/* ---------------- questions ---------------- */

export async function listQuestions(courseId?: string): Promise<Question[]> {
  const snap = courseId
    ? await getDocs(query(col.questions(), where("courseId", "==", courseId)))
    : await getDocs(col.questions());
  return snap.docs.map((d) => withId<Question>(d.id, d.data()));
}

export async function saveQuestion(q: Question): Promise<void> {
  const { id, ...rest } = q;
  await setDoc(doc(col.questions(), id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(col.questions(), id));
}

export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const snap = await getDoc(doc(col.questions(), id));
      return snap.exists() ? withId<Question>(snap.id, snap.data()) : null;
    }),
  );
  return results.filter((q): q is Question => q !== null);
}

/* ---------------- exams ---------------- */

export async function listExams(): Promise<Exam[]> {
  const snap = await getDocs(col.exams());
  return snap.docs
    .map((d) => withId<Exam>(d.id, d.data()))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getExam(id: string): Promise<Exam | null> {
  const snap = await getDoc(doc(col.exams(), id));
  return snap.exists() ? withId<Exam>(snap.id, snap.data()) : null;
}

export async function saveExam(exam: Exam): Promise<void> {
  const { id, ...rest } = exam;
  await setDoc(doc(col.exams(), id), { ...rest, updatedAt: Date.now() }, { merge: true });
}

export async function deleteExam(id: string): Promise<void> {
  await deleteDoc(doc(col.exams(), id));
}

/* ---------------- attempts ---------------- */

export async function listAttempts(): Promise<Attempt[]> {
  const snap = await getDocs(col.attempts());
  return snap.docs.map((d) => withId<Attempt>(d.id, d.data()));
}

export async function listAttemptsForStudent(studentId: string): Promise<Attempt[]> {
  const snap = await getDocs(query(col.attempts(), where("studentId", "==", studentId)));
  return snap.docs
    .map((d) => withId<Attempt>(d.id, d.data()))
    .sort((a, b) => b.startedAt - a.startedAt);
}

export async function listAttemptsForExam(examId: string): Promise<Attempt[]> {
  const snap = await getDocs(query(col.attempts(), where("examId", "==", examId)));
  return snap.docs.map((d) => withId<Attempt>(d.id, d.data()));
}

export async function getAttempt(id: string): Promise<Attempt | null> {
  const snap = await getDoc(doc(col.attempts(), id));
  return snap.exists() ? withId<Attempt>(snap.id, snap.data()) : null;
}

export async function createAttempt(attempt: Omit<Attempt, "id">): Promise<string> {
  const ref = await addDoc(col.attempts(), { ...attempt, serverCreatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateAttempt(id: string, patch: Partial<Attempt>): Promise<void> {
  await updateDoc(doc(col.attempts(), id), patch as Record<string, unknown>);
}

export async function deleteAttempt(id: string): Promise<void> {
  await deleteDoc(doc(col.attempts(), id));
}

export function watchAttempt(id: string, cb: (a: Attempt | null) => void) {
  return onSnapshot(doc(col.attempts(), id), (snap) => {
    cb(snap.exists() ? withId<Attempt>(snap.id, snap.data()) : null);
  });
}

/** Trusted-ish server clock: Firestore server timestamp round-trip offset. */
export async function getServerNow(): Promise<number> {
  try {
    const ref = doc(collection(getDb(), "_clock"));
    await setDoc(ref, { at: serverTimestamp() });
    const snap = await getDoc(ref);
    const ts = snap.get("at") as Timestamp | null;
    await deleteDoc(ref).catch(() => undefined);
    if (ts) return ts.toMillis();
  } catch {
    /* offline or rules block: fall back to device clock */
  }
  return Date.now();
}

/* ---------------- notifications ---------------- */

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const snap = await getDocs(query(col.notifications(), orderBy("createdAt", "desc"), limit(50)));
  return snap.docs
    .map((d) => withId<AppNotification>(d.id, d.data()))
    .filter((n) => n.userId === "all" || n.userId === userId);
}

export async function pushNotification(n: Omit<AppNotification, "id">): Promise<void> {
  await addDoc(col.notifications(), n);
}

/* ---------------- audit ---------------- */

export async function logAudit(entry: Omit<AuditEntry, "id">): Promise<void> {
  await addDoc(col.auditLogs(), entry).catch(() => undefined);
}

export async function listAudit(): Promise<AuditEntry[]> {
  const snap = await getDocs(query(col.auditLogs(), orderBy("createdAt", "desc"), limit(200)));
  return snap.docs.map((d) => withId<AuditEntry>(d.id, d.data()));
}

/* ---------------- settings ---------------- */

export async function getSettings(): Promise<AcademySettings> {
  try {
    const snap = await getDoc(doc(col.settings(), "academy"));
    if (snap.exists()) return { ...DEFAULT_SETTINGS, ...(snap.data() as AcademySettings) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(s: AcademySettings): Promise<void> {
  await setDoc(doc(col.settings(), "academy"), s, { merge: true });
}

export function newId(): string {
  return doc(collection(getDb(), "_ids")).id;
}
