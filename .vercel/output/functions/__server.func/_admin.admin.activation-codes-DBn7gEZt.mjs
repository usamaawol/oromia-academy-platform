import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { I as generateActivationCodes, T as adminRevokeActivationCode, Y as useServerFn, d as adminListActivationCodes, m as adminListCourses, v as adminListStudents } from "./_ssr/server-fns-BeozUQqq.mjs";
import { $ as Copy, B as KeyRound, T as Plus, Z as Download, g as ShieldOff, mt as Check, w as RefreshCw, x as Search } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./_ssr/dialog-DXPbO9yP.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as format } from "./_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.activation-codes-DBn7gEZt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var STATUS_COLORS = {
	available: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
	used: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	revoked: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
	expired: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold", STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border"),
		children: {
			available: "Banaa",
			used: "Hojii irra oole",
			revoked: "Haqame",
			expired: "Darbeera"
		}[status] ?? status
	});
}
function CopyButton({ text }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	function handleCopy() {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: handleCopy,
		className: "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-primary hover:bg-primary/10 transition-colors",
		title: "Copy code",
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3" }), text]
	});
}
function ActivationCodesPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const [codes, setCodes] = (0, import_react.useState)([]);
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [students, setStudents] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [query, setQuery] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [courseFilter, setCourseFilter] = (0, import_react.useState)("all");
	const [showGenerate, setShowGenerate] = (0, import_react.useState)(false);
	const [genCount, setGenCount] = (0, import_react.useState)(1);
	const [genCourseId, setGenCourseId] = (0, import_react.useState)("none");
	const [genUserId, setGenUserId] = (0, import_react.useState)("none");
	const [genExpiry, setGenExpiry] = (0, import_react.useState)("");
	const [genNote, setGenNote] = (0, import_react.useState)("");
	const [generating, setGenerating] = (0, import_react.useState)(false);
	const [newCodes, setNewCodes] = (0, import_react.useState)([]);
	const [revoking, setRevoking] = (0, import_react.useState)(null);
	async function refresh() {
		setLoading(true);
		try {
			const [codesData, coursesData, studentsData] = await Promise.all([
				call(adminListActivationCodes, void 0),
				call(adminListCourses, void 0),
				call(adminListStudents, void 0)
			]);
			setCodes(codesData);
			setCourses(coursesData.filter((c) => c.status === "active"));
			setStudents(studentsData.filter((u) => u.role === "student"));
		} catch (err) {
			toast.error(serverErrorMessage(err, t));
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	const filtered = codes.filter((c) => {
		const matchesStatus = statusFilter === "all" || c.status === statusFilter;
		const matchesCourse = courseFilter === "all" || c.courseId === courseFilter;
		const matchesQuery = !query || c.codeLast4.toLowerCase().includes(query.toLowerCase()) || (c.usedByUserName ?? "").toLowerCase().includes(query.toLowerCase()) || (c.assignedUserName ?? "").toLowerCase().includes(query.toLowerCase()) || (c.note ?? "").toLowerCase().includes(query.toLowerCase());
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
				note: genNote || void 0
			});
			setNewCodes(result);
			toast.success(`${genCount} koodii milkaa'inaan uumame` + (genCount === 1 ? "" : ""));
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
	async function handleRevoke(id) {
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
		const csv = [[
			"Last 4",
			"Course",
			"Assigned To",
			"Status",
			"Used By",
			"Used At",
			"Created",
			"Note"
		], ...filtered.map((c) => [
			c.codeLast4,
			c.courseTitleEn ?? c.courseId ?? "",
			c.assignedUserName ?? "",
			c.status,
			c.usedByUserName ?? "",
			c.usedAt ? format(c.usedAt, "yyyy-MM-dd HH:mm") : "",
			format(c.createdAt, "yyyy-MM-dd HH:mm"),
			c.note ?? ""
		])].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
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
		expired: codes.filter((c) => c.status === "expired").length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-6 text-primary" }), t("admin.activationCodes")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Koodiileen activation barattoota galmeesuuf kennamuudha. Koodiin biraas ni uumamuu danda'a."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => void refresh(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: exportCsv,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 mr-1" }), "CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setShowGenerate(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }), t("admin.generateCode")]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					{
						label: "Waliigala",
						value: stats.total,
						color: "text-foreground"
					},
					{
						label: "Banaa",
						value: stats.available,
						color: "text-emerald-600 dark:text-emerald-400"
					},
					{
						label: "Hojii irra oole",
						value: stats.used,
						color: "text-blue-600 dark:text-blue-400"
					},
					{
						label: "Haqame / Darbeera",
						value: stats.revoked + stats.expired,
						color: "text-red-500"
					}
				].map(({ label, value, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border/60 bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("text-2xl font-bold mt-0.5", color),
						children: value
					})]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[200px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Barbaadi...",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: setStatusFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Haala" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "Hunda"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "available",
								children: "Banaa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "used",
								children: "Hojii irra oole"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "revoked",
								children: "Haqame"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "expired",
								children: "Darbeera"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: courseFilter,
						onValueChange: setCourseFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-48",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Koorsii" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "Koorsiiwwan Hunda"
						}), courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.id,
							children: c.titleOm || c.titleEn
						}, c.id))] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border/60 bg-card overflow-hidden",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 space-y-3",
					children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-lg" }, i))
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 py-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-10 text-muted-foreground/40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Koodiin argamne hin jiru."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setShowGenerate(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }), "Koodii Uumi"]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Koodii"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Koorsii"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Kan Ramadame"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Haala"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Kan Fayyadame"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Yeroo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
									children: "Gochaalee"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/40",
							children: filtered.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-muted/20 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs text-muted-foreground",
												children: "OA-••••-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-sm",
												children: code.codeLast4
											}),
											code.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground mt-0.5",
												children: code.note
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-sm",
										children: code.courseTitleOm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: code.courseTitleOm
										}), code.courseTitleEn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: code.courseTitleEn
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "—"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-sm",
										children: code.assignedUserName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: code.assignedUserName
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "—"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: code.status })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-sm",
										children: code.usedByUserName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: code.usedByUserName
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "—"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-xs text-muted-foreground",
										children: code.usedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-blue-600 dark:text-blue-400",
											children: format(code.usedAt, "MMM d, yyyy")
										}) : code.expiresAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: code.expiresAt < Date.now() ? "text-red-500" : "text-yellow-600 dark:text-yellow-400",
											children: ["Exp: ", format(code.expiresAt, "MMM d, yyyy")]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(code.createdAt, "MMM d, yyyy") })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: code.status === "available" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "sm",
											className: "h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs",
											onClick: () => setRevoking(code.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-3" }), "Haqi"]
										})
									})
								]
							}, code.id))
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showGenerate,
				onOpenChange: (v) => {
					if (!v) handleCloseGenerate();
					else setShowGenerate(true);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-5 text-primary" }), "Koodii Activation Uumi"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Koodiin uumame dhibbantaa SHA-256'n kuufama — koodiin guutuu tokko ol ta'aa kan mul'atu wayita uumamu qofa dha." })] }), newCodes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3",
									children: [
										"✅ ",
										newCodes.length,
										" koodii uumame — amma olkaa'adhuu!"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2 max-h-60 overflow-y-auto",
									children: newCodes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between rounded-lg bg-white dark:bg-background border border-border/60 px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { text: c.rawCode ?? `OA-••••-${c.codeLast4}` }), c.rawCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Koopii godhi — irra deebi'ee hin mul'atu"
										})]
									}, c.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "mt-3 w-full",
									onClick: () => {
										const text = newCodes.map((c) => c.rawCode ?? c.codeLast4).join("\n");
										navigator.clipboard.writeText(text);
										toast.success("Koodiileen hundi kooppii godhamani!");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5 mr-1.5" }), "Hunda Koopii Godhi"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleCloseGenerate,
							children: "Cufi"
						}) })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Baay'ina koodii" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										max: 500,
										value: genCount,
										onChange: (e) => setGenCount(Math.max(1, Math.min(500, Number(e.target.value))))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Guyyaa dhumaa (Filannoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: genExpiry,
										onChange: (e) => setGenExpiry(e.target.value)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Koorsii (Filannoo)" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: genCourseId,
										onValueChange: setGenCourseId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Koorsii filadhu" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "Koorsii tokkollee hin ramadamin"
										}), courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.id,
											children: c.titleOm || c.titleEn
										}, c.id))] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Koorsii filadhuu galmee ofumaan uumama."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Barataa murtaa'aadhaaf ramadi (Filannoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: genUserId,
									onValueChange: setGenUserId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Barataa filadhu" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "none",
										children: "Ramadamaa miti"
									}), students.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: s.id,
										children: [
											s.fullName,
											" — ",
											s.email
										]
									}, s.id))] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Yaadadhu / Qabiyyee (Filannoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "fkn: Garee 3 — Telegram Earning",
									value: genNote,
									onChange: (e) => setGenNote(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-amber-800 dark:text-amber-300",
									children: "⚠️ Koodiin guutuu tokko qofa mul'ata — yeroo uumamu. Koodii guutuu achi booda argachuu hin dandeessu."
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: handleCloseGenerate,
								children: "Haquu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => void handleGenerate(),
								disabled: generating,
								children: generating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 animate-spin" }), "Uumaa jira..."]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), genCount === 1 ? "Koodii Uumi" : `Koodiileen ${genCount} Uumi`]
								})
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!revoking,
				onOpenChange: (v) => {
					if (!v) setRevoking(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-5" }), "Koodii Haqi"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Koodiin kun yeroo haqamu barataan fayyadamuu hin danda'u. Kun deebi'uu hin danda'u." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setRevoking(null),
						children: "Haquu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						onClick: () => revoking && void handleRevoke(revoking),
						children: "Eeyyee, Haqi"
					})] })]
				})
			})
		]
	});
}
//#endregion
export { ActivationCodesPage as component };
