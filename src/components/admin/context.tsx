import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth";
import {
  listAttempts,
  listAudit,
  listCourses,
  listExams,
  listQuestions,
  listUsers,
  getSettings,
  logAudit,
} from "@/lib/data";
import type {
  AcademySettings,
  Attempt,
  AuditEntry,
  Course,
  Exam,
  Question,
  UserProfile,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

type AdminData = {
  courses: Course[];
  questions: Question[];
  exams: Exam[];
  attempts: Attempt[];
  users: UserProfile[];
  audit: AuditEntry[];
  settings: AcademySettings;
  loading: boolean;
  reload: () => Promise<void>;
  record: (action: string, target?: string, before?: string, after?: string) => Promise<void>;
};

const Ctx = createContext<AdminData | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [settings, setSettings] = useState<AcademySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [c, q, e, a, u, l, s] = await Promise.all([
      listCourses().catch(() => [] as Course[]),
      listQuestions().catch(() => [] as Question[]),
      listExams().catch(() => [] as Exam[]),
      listAttempts().catch(() => [] as Attempt[]),
      listUsers().catch(() => [] as UserProfile[]),
      listAudit().catch(() => [] as AuditEntry[]),
      getSettings().catch(() => DEFAULT_SETTINGS),
    ]);
    setCourses(c);
    setQuestions(q);
    setExams(e);
    setAttempts(a);
    setUsers(u);
    setAudit(l);
    setSettings(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const record = useCallback<AdminData["record"]>(
    async (action, target, before, after) => {
      await logAudit({
        userId: profile?.id ?? "unknown",
        userName: profile?.fullName || profile?.email || "unknown",
        action,
        ...(target ? { target } : {}),
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
        createdAt: Date.now(),
      }).catch(() => undefined);
    },
    [profile],
  );

  const value = useMemo<AdminData>(
    () => ({
      courses,
      questions,
      exams,
      attempts,
      users,
      audit,
      settings,
      loading,
      reload,
      record,
    }),
    [courses, questions, exams, attempts, users, audit, settings, loading, reload, record],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminData(): AdminData {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
}
