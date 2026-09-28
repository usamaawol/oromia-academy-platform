/**
 * Admin — Activation Codes management
 *
 * Allows admins to:
 * - Generate single or bulk activation codes
 * - Assign codes to specific students / courses
 * - Set expiration dates
 * - Revoke codes
 * - Search, filter, and copy generated codes
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Download,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  Sparkles,
  Users,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, StatCard, EmptyState } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { useServerFn } from "@/hooks/use-server-fn";
import {
  adminListActivationCodes,
  adminRevokeActivationCode,
  generateActivationCodes,
  adminListCourses,
  adminListStudents,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import type { ActivationCodeAdminView, Course, Profile } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/activation-codes")({
  component: ActivationCodesPage,
});

type CodeStatus = "available" | "used" | "revoked" | "expired";

const STATUS_META: Record<
  string,
  {
    label: string;
    icon: React.FC<{ className?: string }>;
    dotColor: string;
    variantClasses: string;
  }
> = {
  available: {
    label: "Banaa",
    icon: CheckCircle2,
    dotColor: "bg-success",
    variantClasses:
      "border-success/25 bg-success/[0.10] text-success dark:border-success/35 dark:bg-success/15",
  },
  used: {
    label: "Hojii irra oole",
    icon: CheckCircle2,
    dotColor: "bg-info",
    variantClasses:
      "border-info/25 bg-info/[0.10] text-info dark:border-info/35 dark:bg-info/15",
  },
  revoked: {
    label: "Haqame",
    icon: Ban,
    dotColor: "bg-destructive",
    variantClasses:
      "border-destructive/25 bg-destructive/[0.10] text-destructive dark:border-destructive/35 dark:bg-destructive/15",
  },
  expired: {
    label: "Darbeera",
    icon: AlertCircle,
    dotColor: "bg-warning",
    variantClasses:
      "border-warning/25 bg-warning/[0.10] text-warning-foreground dark:border-warning/35 dark:bg-warning/15",
  },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    icon: Clock,
    dotColor: "bg-muted-foreground",
    variantClasses:
      "border-border/70 bg-muted/60 text-muted-foreground",
  };
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-tight",
        meta.variantClasses,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotColor)} />
      <Icon className="size-[13px] shrink-0" strokeWidth={2} />
      <span className="leading-none">{meta.label}</span>
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1",
        "text-[12px] font-mono font-semibold tracking-tight",
        "text-primary hover:bg-primary/[0.12] hover:text-primary",
        "transition-all duration-160 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      )}
      title="Copy code"
    >
      {copied ? (
        <Check className="size-[13px] text-success" strokeWidth={2.2} />
      ) : (
        <Copy className="size-[13px]" strokeWidth={1.9} />
      )}
      <span className="tracking-wide">{text}</span>
    </button>
  );
}

function MiniAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "size-6 text-[10px]",
    md: "size-8 text-[11px]",
  };

  const colors = [
    "from-primary/25 via-primary/15 to-primary/5 text-primary ring-primary/25",
    "from-info/25 via-info/15 to-info/5 text-info ring-info/25",
    "from-success/25 via-success/15 to-success/5 text-success ring-success/25",
    "from-warning/28 via-warning/16 to-warning/5 text-warning-foreground ring-warning/25",
    "from-destructive/22 via-destructive/12 to-destructive/5 text-destructive ring-destructive/25",
  ];

  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorSet = colors[hash % colors.length];

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-lg",
        "bg-gradient-to-br ring-1",
        colorSet,
        sizeClasses[size],
        "font-bold tracking-tight",
      )}
      title={name}
    >
      {initials || "?"}
    </div>
  );
}

function ActivationCodesPage() {
  const { t } = useI18n();
  const call = useServerFn();

  const [codes, setCodes] = useState<ActivationCodeAdminView[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Generate dialog
  const [showGenerate, setShowGenerate] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genCourseId, setGenCourseId] = useState<string>("none");
  const [genUserId, setGenUserId] = useState<string>("none");
  const [genExpiry, setGenExpiry] = useState<string>("");
  const [genNote, setGenNote] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [newCodes, setNewCodes] = useState<ActivationCodeAdminView[]>([]);

  // Revoke confirmation
  const [revoking, setRevoking] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [codesData, coursesData, studentsData] = await Promise.all([
        call(adminListActivationCodes, undefined),
        call(adminListCourses, undefined),
        call(adminListStudents, undefined),
      ]);
      setCodes(codesData as ActivationCodeAdminView[]);
      setCourses((coursesData as Course[]).filter((c) => c.status === "active"));
      setStudents((studentsData as Profile[]).filter((u) => u.role === "student"));
    } catch (err) {
      toast.error(serverErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = codes.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesCourse = courseFilter === "all" || c.courseId === courseFilter;
    const matchesQuery =
      !query ||
      c.codeLast4.toLowerCase().includes(query.toLowerCase()) ||
      (c.usedByUserName ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (c.assignedUserName ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (c.note ?? "").toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesCourse && matchesQuery;
  });

  async function handleGenerate() {
    setGenerating(true);
    try {
      const expiresAt = genExpiry ? new Date(genExpiry).getTime() : null;
      const result = await call(generateActivationCodes, {
        count: genCount,
        courseId: genCourseId === "none" ? null : genCourseId,
        assignedUserId: genUserId === "none" ? null : genUserId,
        expiresAt,
        note: genNote || undefined,
      });
      setNewCodes(result as ActivationCodeAdminView[]);
      toast.success(
        `${genCount} koodii milkaa'inaan uumame` +
          (genCount === 1 ? "" : ""),
      );
      await refresh();
    } catch (err) {
      toast.error(serverErrorMessage(err, t));
    } finally {
      setGenerating(false);
    }
  }

  function handleCloseGenerate() {
    setShowGenerate(false);
    setNewCodes([]);
    setGenCount(1);
    setGenCourseId("none");
    setGenUserId("none");
    setGenExpiry("");
    setGenNote("");
  }

  async function handleRevoke(id: string) {
    try {
      await call(adminRevokeActivationCode, { id });
      toast.success("Koodiin haqame.");
      setRevoking(null);
      await refresh();
    } catch (err) {
      toast.error(serverErrorMessage(err, t));
    }
  }

  function exportCsv() {
    const rows = [
      ["Last 4", "Course", "Assigned To", "Status", "Used By", "Used At", "Created", "Note"],
      ...filtered.map((c) => [
        c.codeLast4,
        c.courseTitleEn ?? c.courseId ?? "",
        c.assignedUserName ?? "",
        c.status,
        c.usedByUserName ?? "",
        c.usedAt ? format(c.usedAt, "yyyy-MM-dd HH:mm") : "",
        format(c.createdAt, "yyyy-MM-dd HH:mm"),
        c.note ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activation-codes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = {
    total: codes.length,
    available: codes.filter((c) => c.status === "available").length,
    used: codes.filter((c) => c.status === "used").length,
    revoked: codes.filter((c) => c.status === "revoked").length,
    expired: codes.filter((c) => c.status === "expired").length,
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Page Header — premium */}
      <PageHeader
        title={t("admin.activationCodes")}
        subtitle="Koodiileen activation barattoota galmeesuuf kennamuudha. Koodiin biraas ni uumamuu danda'a. Manage student activation credentials with SHA-256 hashed security."
        icon={<KeyRound className="size-5" strokeWidth={1.9} />}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => void refresh()}
              title="Refresh"
            >
              <RefreshCw className="size-4" strokeWidth={1.9} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={exportCsv}
            >
              <Download className="size-4" strokeWidth={1.9} />
              <span className="font-medium">CSV</span>
            </Button>
            <Button size="sm" className="h-9 gap-2" onClick={() => setShowGenerate(true)}>
              <Sparkles className="size-4" strokeWidth={1.9} />
              <span className="font-medium">{t("admin.generateCode")}</span>
            </Button>
          </div>
        }
      />

      {/* Stats row — premium stat cards */}
      {!loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 animate-fade-in-up">
          <StatCard
            label="Waliigala"
            value={stats.total}
            sub="All codes ever created"
            accent="default"
            icon={<KeyRound className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Banaa"
            value={stats.available}
            sub="Ready to be redeemed"
            accent="success"
            icon={<CheckCircle2 className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Hojii irra oole"
            value={stats.used}
            sub="Successfully activated"
            accent="info"
            icon={<Users className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Haqame / Darbeera"
            value={stats.revoked + stats.expired}
            sub="Revoked or expired"
            accent="danger"
            icon={<ShieldOff className="size-4" strokeWidth={1.9} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[88px] sm:h-[96px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Filters row — premium */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3",
          "p-3 sm:p-3.5 rounded-xl",
          "bg-card border border-border/60",
          "shadow-soft",
        )}
      >
        <div className="relative flex-1 min-w-[220px] sm:min-w-[280px]">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70"
            strokeWidth={1.9}
          />
          <Input
            placeholder="Barbaadi — last 4, user, note, course..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10 text-[13px] bg-background/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-40 sm:w-44 text-[13px] px-3 bg-background/50">
              <SelectValue placeholder="Haala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Haala — Hunda</SelectItem>
              <SelectItem value="available">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-success" />
                  Banaa
                </span>
              </SelectItem>
              <SelectItem value="used">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-info" />
                  Hojii irra oole
                </span>
              </SelectItem>
              <SelectItem value="revoked">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-destructive" />
                  Haqame
                </span>
              </SelectItem>
              <SelectItem value="expired">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-warning" />
                  Darbeera
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="h-10 w-44 sm:w-56 text-[13px] px-3 bg-background/50">
              <SelectValue placeholder="Koorsii" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-3.5" strokeWidth={1.9} />
                  Koorsiiwwan Hunda
                </span>
              </SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.titleOm || c.titleEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table — premium */}
      <div
        className={cn(
          "rounded-xl border border-border/70 bg-card overflow-hidden",
          "shadow-card",
        )}
      >
        {loading ? (
          <div className="space-y-0">
            <div className="h-12 bg-muted/40 border-b border-border/50" />
            <div className="p-4 sm:p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 sm:gap-4 py-1.5"
                >
                  <div className="skeleton-shimmer size-10 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="skeleton-shimmer h-3.5 w-24 sm:w-32 rounded-md" />
                    <div className="skeleton-shimmer h-3 w-32 sm:w-48 rounded-md hidden sm:block" />
                  </div>
                  <div className="skeleton-shimmer h-6 w-20 sm:w-24 rounded-lg shrink-0" />
                  <div className="skeleton-shimmer h-6 w-20 sm:w-28 rounded-lg shrink-0 hidden sm:block" />
                  <div className="skeleton-shimmer h-6 w-28 sm:w-32 rounded-lg shrink-0 hidden md:block" />
                  <div className="skeleton-shimmer h-7 w-7 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 sm:p-10">
            <EmptyState
              icon={<KeyRound className="size-7" strokeWidth={1.8} />}
              title="Koodiin argamne hin jiru."
              body="No activation codes match your current filters. Try adjusting search or generate new codes."
              action={
                <Button size="sm" className="h-9 gap-2 mt-1" onClick={() => setShowGenerate(true)}>
                  <Plus className="size-4" strokeWidth={1.9} />
                  Koodii Uumi
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead
                  className={cn(
                    "border-b border-border/60",
                    "bg-gradient-to-b from-muted/50 to-muted/30",
                  )}
                >
                  <tr>
                    <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Koodii
                    </th>
                    <th className="hidden sm:table-cell px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Koorsii
                    </th>
                    <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Kan Ramadame
                    </th>
                    <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Haala
                    </th>
                    <th className="hidden md:table-cell px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Kan Fayyadame
                    </th>
                    <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Yeroo
                    </th>
                    <th className="px-4 sm:px-5 py-3.5 text-right font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                      Gochaalee
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((code, idx) => (
                    <tr
                      key={code.id}
                      className={cn(
                        "group transition-all duration-180 ease-out",
                        "hover:bg-muted/[0.06] dark:hover:bg-muted/[0.12]",
                        "animate-fade-in-up",
                      )}
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={cn(
                              "size-10 grid place-items-center shrink-0 rounded-xl",
                              "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
                              "ring-1 ring-primary/25",
                              "text-primary",
                            )}
                          >
                            <KeyRound className="size-[18px]" strokeWidth={1.9} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-muted-foreground/70 tracking-wider">
                                OA-••••-
                              </span>
                              <span
                                className={cn(
                                  "font-mono font-bold text-[14px] tracking-wider",
                                  "text-foreground",
                                )}
                              >
                                {code.codeLast4}
                              </span>
                            </div>
                            {code.note && (
                              <p
                                className="text-[11.5px] text-muted-foreground mt-0.5 truncate max-w-[180px] sm:max-w-[220px]"
                                title={code.note}
                              >
                                {code.note}
                              </p>
                            )}
                            {/* sm: mobile course */}
                            {code.courseTitleOm && (
                              <p className="sm:hidden text-[11.5px] text-muted-foreground mt-1 truncate">
                                {code.courseTitleOm}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-5 py-3 sm:py-3.5 text-sm min-w-0">
                        {code.courseTitleOm ? (
                          <div className="min-w-0">
                            <p className="font-medium text-[13px] truncate">
                              {code.courseTitleOm}
                            </p>
                            {code.courseTitleEn && (
                              <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                                {code.courseTitleEn}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-[12px] italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-sm">
                        {code.assignedUserName ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <MiniAvatar name={code.assignedUserName} />
                            <span className="font-medium text-[13px] truncate">
                              {code.assignedUserName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-[12px] italic">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                        <StatusBadge status={code.status} />
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-5 py-3 sm:py-3.5 text-sm">
                        {code.usedByUserName ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <MiniAvatar name={code.usedByUserName} />
                            <span className="font-medium text-[13px] truncate">
                              {code.usedByUserName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-[12px] italic">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                        {code.usedAt ? (
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-[12px] font-medium tabular-nums",
                                "text-info",
                              )}
                            >
                              {format(code.usedAt, "MMM d, yyyy")}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground/70">
                              Used
                            </span>
                          </div>
                        ) : code.expiresAt ? (
                          <div className="flex flex-col">
                            <span
                              className={cn(
                                "text-[12px] font-medium tabular-nums",
                                code.expiresAt < Date.now()
                                  ? "text-destructive"
                                  : "text-warning-foreground",
                              )}
                            >
                              {format(code.expiresAt, "MMM d, yyyy")}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground/70">
                              {code.expiresAt < Date.now() ? "Expired" : "Expires"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[12px] font-medium text-foreground/80 tabular-nums">
                              {format(code.createdAt, "MMM d, yyyy")}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground/70">
                              Created
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {code.status === "available" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 text-[11.5px] gap-1.5 font-medium",
                                "text-destructive hover:bg-destructive/[0.08]",
                              )}
                              onClick={() => setRevoking(code.id)}
                            >
                              <ShieldOff className="size-3.5" strokeWidth={2} />
                              Haqi
                            </Button>
                          )}
                          {code.status !== "available" && (
                            <span className="text-[11px] text-muted-foreground/50 italic pr-1">
                              No action
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table footer */}
            <div
              className={cn(
                "flex items-center justify-between px-4 sm:px-5 py-3",
                "border-t border-border/50 bg-muted/20",
                "text-[12px] text-muted-foreground",
              )}
            >
              <span className="tabular-nums">
                Showing{" "}
                <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                of {stats.total} codes
              </span>
              <span className="hidden sm:block">
                {stats.available} available · {stats.used} redeemed
              </span>
            </div>
          </>
        )}
      </div>

      {/* ==================== GENERATE DIALOG ==================== */}
      <Dialog open={showGenerate} onOpenChange={(v) => { if (!v) handleCloseGenerate(); else setShowGenerate(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 tracking-tight">
              <span className="size-8 grid place-items-center rounded-lg bg-gradient-to-br from-primary/25 via-primary/15 to-transparent ring-1 ring-primary/30 text-primary shrink-0">
                <KeyRound className="size-4.5" strokeWidth={1.9} />
              </span>
              <span>Koodii Activation Uumi</span>
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              Koodiin uumame dhibbantaa SHA-256'n kuufama — koodiin guutuu
              tokko ol ta'aa kan mul'atu wayita uumamu qofa dha.
            </DialogDescription>
          </DialogHeader>

          {newCodes.length > 0 ? (
            /* Show freshly generated codes — only opportunity to copy them */
            <div className="space-y-4 sm:space-y-5">
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-5 relative overflow-hidden",
                  "border-success/30 bg-success/[0.08] dark:bg-success/[0.12]",
                )}
              >
                {/* Accent glow */}
                <div className="absolute -right-12 -top-12 size-32 bg-success/20 blur-3xl rounded-full pointer-events-none" />

                <div className="flex items-start gap-3 mb-4 relative">
                  <div className="size-10 shrink-0 grid place-items-center rounded-xl bg-success/20 ring-1 ring-success/30 text-success">
                    <CheckCircle2 className="size-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold tracking-tight text-success leading-tight">
                      {newCodes.length} koodii uumame — amma olkaa'adhuu!
                    </p>
                    <p className="text-[12px] text-success/80 mt-1">
                      Save these codes immediately — they won't be shown again.
                    </p>
                  </div>
                </div>

                <div
                  className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-border/40 bg-card/60 p-2"
                >
                  {newCodes.map((c, idx) => (
                    <div
                      key={c.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-border/50 bg-background px-3 py-2.5",
                        "hover:border-border hover:shadow-xs",
                        "transition-all duration-150",
                        "animate-fade-in-up",
                      )}
                      style={{ animationDelay: `${idx * 35}ms` }}
                    >
                      <CopyButton text={c.rawCode ?? `OA-••••-${c.codeLast4}`} />
                      {c.rawCode && (
                        <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                          <span className="hidden sm:inline">Copy once — </span>
                          Hin mul'aninne
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  className="mt-4 w-full h-10 gap-2 font-medium"
                  onClick={() => {
                    const text = newCodes.map((c) => c.rawCode ?? c.codeLast4).join("\n");
                    void navigator.clipboard.writeText(text);
                    toast.success("Koodiileen hundi kooppii godhamani!");
                  }}
                >
                  <Copy className="size-4" strokeWidth={1.9} />
                  Hunda Koopii Godhi
                </Button>
              </div>

              <DialogFooter>
                <Button onClick={handleCloseGenerate} className="h-10 gap-2 font-medium">
                  Cufi
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* Generation form */
            <div className="space-y-4 sm:space-y-5">
              {/* Count + Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-medium">Baay'ina koodii</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={genCount}
                    onChange={(e) => setGenCount(Math.max(1, Math.min(500, Number(e.target.value))))}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-medium">Guyyaa dhumaa (Filannoo)</Label>
                  <Input
                    type="date"
                    value={genExpiry}
                    onChange={(e) => setGenExpiry(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-medium flex items-center gap-1.5">
                  <BookOpen className="size-3.5" strokeWidth={1.9} />
                  Koorsii (Filannoo)
                </Label>
                <Select value={genCourseId} onValueChange={setGenCourseId}>
                  <SelectTrigger className="h-10 px-3 text-[13px]">
                    <SelectValue placeholder="Koorsii filadhu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Koorsii tokkollee hin ramadamin</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.titleOm || c.titleEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  Koorsii filadhuu galmee ofumaan uumama. Activation codes tied to one course only.
                </p>
              </div>

              {/* Student */}
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-medium flex items-center gap-1.5">
                  <Users className="size-3.5" strokeWidth={1.9} />
                  Barataa murtaa'aadhaaf ramadi (Filannoo)
                </Label>
                <Select value={genUserId} onValueChange={setGenUserId}>
                  <SelectTrigger className="h-10 px-3 text-[13px]">
                    <SelectValue placeholder="Barataa filadhu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ramadamaa miti</SelectItem>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.fullName} — {s.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-medium">Yaadadhu / Qabiyyee (Filannoo)</Label>
                <Input
                  placeholder="fkn: Garee 3 — Telegram Earning cohort"
                  value={genNote}
                  onChange={(e) => setGenNote(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Warning callout */}
              <div
                className={cn(
                  "rounded-xl border p-3.5 sm:p-4 relative overflow-hidden",
                  "border-warning/35 bg-warning/[0.08] dark:bg-warning/[0.12]",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="size-6 shrink-0 grid place-items-center rounded-md bg-warning/20 text-warning-foreground mt-0.5">
                    <AlertCircle className="size-3.5" strokeWidth={2} />
                  </div>
                  <p className="text-[12px] font-medium text-warning-foreground/90 leading-relaxed">
                    Koodiin guutuu tokko qofa mul'ata — wayita uumamu. Koodii
                    guutuu achi booda argachuu hin dandeessu. Store them securely.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-2.5 pt-1">
                <Button variant="outline" onClick={handleCloseGenerate} className="h-10 font-medium">
                  Haquu
                </Button>
                <Button
                  onClick={() => void handleGenerate()}
                  disabled={generating}
                  className="h-10 gap-2 font-medium"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="size-4 animate-spin" strokeWidth={1.9} />
                      Uumaa jira...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-4" strokeWidth={1.9} />
                      {genCount === 1 ? "Koodii Uumi" : `Koodiileen ${genCount} Uumi`}
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== REVOKE CONFIRM — premium ==================== */}
      <Dialog open={!!revoking} onOpenChange={(v) => { if (!v) setRevoking(null); }}>
        <DialogContent className="max-w-sm sm:max-w-sm">
          <DialogHeader className="gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "size-11 shrink-0 grid place-items-center rounded-xl",
                  "bg-destructive/[0.10] ring-1 ring-destructive/25",
                  "text-destructive",
                )}
              >
                <Ban className="size-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 pt-0.5">
                <DialogTitle className="text-[15px] tracking-tight text-destructive leading-tight">
                  Koodii Haqi
                </DialogTitle>
                <DialogDescription className="mt-1.5 leading-relaxed">
                  Koodiin kun yeroo haqamu barataan fayyadamuu hin danda'u. Kun
                  deebi'uu hin danda'u — this action is permanent.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <Button variant="outline" onClick={() => setRevoking(null)} className="h-10 font-medium">
              Haquu
            </Button>
            <Button
              variant="destructive"
              onClick={() => revoking && void handleRevoke(revoking)}
              className="h-10 gap-2 font-medium"
            >
              <ShieldOff className="size-4" strokeWidth={1.9} />
              Eeyyee, Haqi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
