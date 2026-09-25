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
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const STATUS_COLORS: Record<string, string> = {
  available:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  used: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  revoked:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  expired:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
};

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    available: "Banaa",
    used: "Hojii irra oole",
    revoked: "Haqame",
    expired: "Darbeera",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {labels[status] ?? status}
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
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-primary hover:bg-primary/10 transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
      {text}
    </button>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="size-6 text-primary" />
            {t("admin.activationCodes")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Koodiileen activation barattoota galmeesuuf kennamuudha. Koodiin biraas ni uumamuu danda'a.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-4 mr-1" />
            CSV
          </Button>
          <Button size="sm" onClick={() => setShowGenerate(true)}>
            <Plus className="size-4 mr-1" />
            {t("admin.generateCode")}
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Waliigala", value: stats.total, color: "text-foreground" },
          { label: "Banaa", value: stats.available, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Hojii irra oole", value: stats.used, color: "text-blue-600 dark:text-blue-400" },
          { label: "Haqame / Darbeera", value: stats.revoked + stats.expired, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Barbaadi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Haala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hunda</SelectItem>
            <SelectItem value="available">Banaa</SelectItem>
            <SelectItem value="used">Hojii irra oole</SelectItem>
            <SelectItem value="revoked">Haqame</SelectItem>
            <SelectItem value="expired">Darbeera</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Koorsii" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Koorsiiwwan Hunda</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.titleOm || c.titleEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <KeyRound className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Koodiin argamne hin jiru.</p>
            <Button size="sm" onClick={() => setShowGenerate(true)}>
              <Plus className="size-4 mr-1" />
              Koodii Uumi
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Koodii
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Koorsii
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Kan Ramadame
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Haala
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Kan Fayyadame
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Yeroo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Gochaalee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((code) => (
                  <tr key={code.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      {/* Only show last 4 — full code never displayed post-generation */}
                      <span className="font-mono text-xs text-muted-foreground">
                        OA-••••-
                      </span>
                      <span className="font-mono font-bold text-sm">{code.codeLast4}</span>
                      {code.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{code.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {code.courseTitleOm ? (
                        <div>
                          <p className="font-medium">{code.courseTitleOm}</p>
                          {code.courseTitleEn && (
                            <p className="text-xs text-muted-foreground">{code.courseTitleEn}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {code.assignedUserName ? (
                        <span className="font-medium">{code.assignedUserName}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={code.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {code.usedByUserName ? (
                        <span className="font-medium">{code.usedByUserName}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {code.usedAt ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          {format(code.usedAt, "MMM d, yyyy")}
                        </span>
                      ) : code.expiresAt ? (
                        <span
                          className={
                            code.expiresAt < Date.now()
                              ? "text-red-500"
                              : "text-yellow-600 dark:text-yellow-400"
                          }
                        >
                          Exp: {format(code.expiresAt, "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span>{format(code.createdAt, "MMM d, yyyy")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {code.status === "available" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                          onClick={() => setRevoking(code.id)}
                        >
                          <ShieldOff className="size-3" />
                          Haqi
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== GENERATE DIALOG ==================== */}
      <Dialog open={showGenerate} onOpenChange={(v) => { if (!v) handleCloseGenerate(); else setShowGenerate(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Koodii Activation Uumi
            </DialogTitle>
            <DialogDescription>
              Koodiin uumame dhibbantaa SHA-256'n kuufama — koodiin guutuu
              tokko ol ta'aa kan mul'atu wayita uumamu qofa dha.
            </DialogDescription>
          </DialogHeader>

          {newCodes.length > 0 ? (
            /* Show freshly generated codes — only opportunity to copy them */
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-4">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
                  ✅ {newCodes.length} koodii uumame — amma olkaa'adhuu!
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newCodes.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg bg-white dark:bg-background border border-border/60 px-3 py-2"
                    >
                      <CopyButton text={c.rawCode ?? `OA-••••-${c.codeLast4}`} />
                      {c.rawCode && (
                        <span className="text-xs text-muted-foreground">
                          Koopii godhi — irra deebi'ee hin mul'atu
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    const text = newCodes.map((c) => c.rawCode ?? c.codeLast4).join("\n");
                    void navigator.clipboard.writeText(text);
                    toast.success("Koodiileen hundi kooppii godhamani!");
                  }}
                >
                  <Copy className="size-3.5 mr-1.5" />
                  Hunda Koopii Godhi
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseGenerate}>Cufi</Button>
              </DialogFooter>
            </div>
          ) : (
            /* Generation form */
            <div className="space-y-4">
              {/* Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Baay'ina koodii</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={genCount}
                    onChange={(e) => setGenCount(Math.max(1, Math.min(500, Number(e.target.value))))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Guyyaa dhumaa (Filannoo)</Label>
                  <Input
                    type="date"
                    value={genExpiry}
                    onChange={(e) => setGenExpiry(e.target.value)}
                  />
                </div>
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <Label>Koorsii (Filannoo)</Label>
                <Select value={genCourseId} onValueChange={setGenCourseId}>
                  <SelectTrigger>
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
                <p className="text-xs text-muted-foreground">
                  Koorsii filadhuu galmee ofumaan uumama.
                </p>
              </div>

              {/* Student */}
              <div className="space-y-1.5">
                <Label>Barataa murtaa'aadhaaf ramadi (Filannoo)</Label>
                <Select value={genUserId} onValueChange={setGenUserId}>
                  <SelectTrigger>
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
                <Label>Yaadadhu / Qabiyyee (Filannoo)</Label>
                <Input
                  placeholder="fkn: Garee 3 — Telegram Earning"
                  value={genNote}
                  onChange={(e) => setGenNote(e.target.value)}
                />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ Koodiin guutuu tokko qofa mul'ata — yeroo uumamu. Koodii
                  guutuu achi booda argachuu hin dandeessu.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseGenerate}>
                  Haquu
                </Button>
                <Button onClick={() => void handleGenerate()} disabled={generating}>
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="size-3.5 animate-spin" />
                      Uumaa jira...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="size-3.5" />
                      {genCount === 1 ? "Koodii Uumi" : `Koodiileen ${genCount} Uumi`}
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== REVOKE CONFIRM ==================== */}
      <Dialog open={!!revoking} onOpenChange={(v) => { if (!v) setRevoking(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldOff className="size-5" />
              Koodii Haqi
            </DialogTitle>
            <DialogDescription>
              Koodiin kun yeroo haqamu barataan fayyadamuu hin danda'u. Kun
              deebi'uu hin danda'u.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevoking(null)}>
              Haquu
            </Button>
            <Button
              variant="destructive"
              onClick={() => revoking && void handleRevoke(revoking)}
            >
              Eeyyee, Haqi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
