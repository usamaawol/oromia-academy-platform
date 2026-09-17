/**
 * Single data façade. Uses Firebase when configured, otherwise the local
 * offline store so the app is fully usable without credentials.
 */
import * as fdb from "./db";
import { firebaseReady } from "./firebase";
import { mutate, readDb, uid } from "./local-store";
import type {
  AcademySettings,
  Attempt,
  AuditEntry,
  Course,
  Exam,
  AppNotification,
  Question,
  UserProfile,
} from "./types";

export const usingLocal = !firebaseReady;

export function newId(prefix = "id"): string {
  return usingLocal ? uid(prefix) : fdb.newId();
}

/* courses */
export async function listCourses(): Promise<Course[]> {
  if (usingLocal) return [...readDb().courses].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  return fdb.listCourses();
}
export async function saveCourse(c: Course): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      const i = db.courses.findIndex((x) => x.id === c.id);
      db.courses = i >= 0 ? db.courses.map((x) => (x.id === c.id ? c : x)) : [...db.courses, c];
    });
    return;
  }
  await fdb.saveCourse(c);
}
export async function deleteCourse(id: string): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.courses = db.courses.filter((c) => c.id !== id);
    });
    return;
  }
  await fdb.deleteCourse(id);
}

/* questions */
export async function listQuestions(courseId?: string): Promise<Question[]> {
  if (usingLocal) {
    const qs = readDb().questions;
    return courseId ? qs.filter((q) => q.courseId === courseId) : qs;
  }
  return fdb.listQuestions(courseId);
}
export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (usingLocal) {
    const byId = new Map(readDb().questions.map((q) => [q.id, q]));
    return ids.map((id) => byId.get(id)).filter((q): q is Question => q !== undefined);
  }
  return fdb.getQuestionsByIds(ids);
}
export async function saveQuestion(q: Question): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      const i = db.questions.findIndex((x) => x.id === q.id);
      db.questions =
        i >= 0 ? db.questions.map((x) => (x.id === q.id ? q : x)) : [...db.questions, q];
    });
    return;
  }
  await fdb.saveQuestion(q);
}
export async function deleteQuestion(id: string): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.questions = db.questions.filter((q) => q.id !== id);
    });
    return;
  }
  await fdb.deleteQuestion(id);
}

/* exams */
export async function listExams(): Promise<Exam[]> {
  if (usingLocal)
    return [...readDb().exams].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return fdb.listExams();
}
export async function getExam(id: string): Promise<Exam | null> {
  if (usingLocal) return readDb().exams.find((e) => e.id === id) ?? null;
  return fdb.getExam(id);
}
export async function saveExam(e: Exam): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      const i = db.exams.findIndex((x) => x.id === e.id);
      db.exams = i >= 0 ? db.exams.map((x) => (x.id === e.id ? e : x)) : [...db.exams, e];
    });
    return;
  }
  await fdb.saveExam(e);
}
export async function deleteExam(id: string): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.exams = db.exams.filter((e) => e.id !== id);
    });
    return;
  }
  await fdb.deleteExam(id);
}

/* attempts */
export async function listAttempts(): Promise<Attempt[]> {
  if (usingLocal) return readDb().attempts;
  return fdb.listAttempts();
}
export async function listAttemptsForStudent(studentId: string): Promise<Attempt[]> {
  if (usingLocal)
    return readDb()
      .attempts.filter((a) => a.studentId === studentId)
      .sort((a, b) => b.startedAt - a.startedAt);
  return fdb.listAttemptsForStudent(studentId);
}
export async function listAttemptsForExam(examId: string): Promise<Attempt[]> {
  if (usingLocal) return readDb().attempts.filter((a) => a.examId === examId);
  return fdb.listAttemptsForExam(examId);
}
export async function deleteAttempt(id: string): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.attempts = db.attempts.filter((a) => a.id !== id);
    });
    return;
  }
  await fdb.deleteAttempt(id);
}
export async function getAttempt(id: string): Promise<Attempt | null> {
  if (usingLocal) return readDb().attempts.find((a) => a.id === id) ?? null;
  return fdb.getAttempt(id);
}
export async function createAttempt(attempt: Omit<Attempt, "id">): Promise<string> {
  if (usingLocal) {
    const id = uid("att");
    mutate((db) => {
      db.attempts = [...db.attempts, { ...attempt, id } as Attempt];
    });
    return id;
  }
  return fdb.createAttempt(attempt);
}
export async function updateAttempt(id: string, patch: Partial<Attempt>): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.attempts = db.attempts.map((a) => (a.id === id ? { ...a, ...patch } : a));
    });
    return;
  }
  await fdb.updateAttempt(id, patch);
}

export async function serverNow(): Promise<number> {
  if (usingLocal) return Date.now();
  return fdb.getServerNow();
}

/* users */
export async function listUsers(): Promise<UserProfile[]> {
  if (usingLocal) return readDb().users;
  return fdb.listUsers();
}
export async function saveUser(p: UserProfile): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      const i = db.users.findIndex((x) => x.id === p.id);
      db.users = i >= 0 ? db.users.map((x) => (x.id === p.id ? p : x)) : [...db.users, p];
    });
    return;
  }
  await fdb.saveUserProfile(p);
}

export async function deleteUser(id: string): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.users = db.users.filter((u) => u.id !== id);
    });
    return;
  }
  await fdb.deleteUserProfile(id);
}

/* notifications */
export async function listNotifications(userId: string): Promise<AppNotification[]> {
  if (usingLocal)
    return readDb()
      .notifications.filter((n) => n.userId === "all" || n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  return fdb.listNotifications(userId);
}

export async function pushNotification(n: Omit<AppNotification, "id">): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.notifications = [...db.notifications, { ...n, id: uid("n") }];
    });
    return;
  }
  await fdb.pushNotification(n);
}

/* audit */
export async function logAudit(entry: Omit<AuditEntry, "id">): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.audit = [{ ...entry, id: uid("a") }, ...db.audit].slice(0, 200);
    });
    return;
  }
  await fdb.logAudit(entry);
}
export async function listAudit(): Promise<AuditEntry[]> {
  if (usingLocal) return [...readDb().audit].sort((a, b) => b.createdAt - a.createdAt);
  return fdb.listAudit();
}

/* settings */
export async function getSettings(): Promise<AcademySettings> {
  if (usingLocal) return readDb().settings;
  return fdb.getSettings();
}
export async function saveSettings(s: AcademySettings): Promise<void> {
  if (usingLocal) {
    mutate((db) => {
      db.settings = s;
    });
    return;
  }
  await fdb.saveSettings(s);
}
