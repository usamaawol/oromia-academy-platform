import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { v as useSearch } from "./_libs/@tanstack/react-router+[...].mjs";
import { E as adminSaveCourse, Y as useServerFn, i as adminDeleteCourse, m as adminListCourses } from "./_ssr/server-fns-BeozUQqq.mjs";
import { E as Pencil, T as Plus, f as Trash2 } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-DXPbO9yP.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.courses-DvvUxNv5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Courses management
*/
var BLANK_COURSE = {
	id: "",
	titleOm: "",
	titleEn: "",
	descOm: "",
	descEn: "",
	icon: "sparkles",
	level: "medium",
	status: "draft",
	order: 0
};
function CoursesPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const search = useSearch({ from: "/_admin/admin/courses" });
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(BLANK_COURSE);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const refresh = async () => {
		setLoading(true);
		try {
			const data = await call(adminListCourses, void 0);
			setCourses(data.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	(0, import_react.useEffect)(() => {
		if (search.new === "1" && !loading) openNew();
	}, [search.new, loading]);
	function openNew() {
		setEditing({
			...BLANK_COURSE,
			id: crypto.randomUUID()
		});
		setDialogOpen(true);
	}
	function openEdit(c) {
		setEditing({ ...c });
		setDialogOpen(true);
	}
	async function save() {
		if (!editing.titleEn.trim() || !editing.titleOm.trim()) {
			toast.error("Title is required");
			return;
		}
		setSaving(true);
		try {
			await call(adminSaveCourse, { course: editing });
			toast.success(t("common.success"));
			setDialogOpen(false);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	async function remove(id) {
		if (!confirm("Delete this course?")) return;
		try {
			await call(adminDeleteCourse, { id });
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: t("admin.courses")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: openNew,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }),
					" ",
					t("admin.newCourse")
				]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" }, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base leading-snug",
						children: c.titleEn
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: c.status === "active" ? "default" : "secondary",
						className: "shrink-0 capitalize text-xs",
						children: c.status
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: c.titleOm
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground line-clamp-2",
				children: c.descEn
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "capitalize",
					children: c.level
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => openEdit(c),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => void remove(c.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
					})]
				})]
			})] })] }, c.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: dialogOpen,
			onOpenChange: setDialogOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90vh] overflow-y-auto sm:max-w-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing.id && courses.find((c) => c.id === editing.id) ? t("common.edit") : t("admin.newCourse") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title (English) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editing.titleEn,
									onChange: (e) => setEditing((p) => ({
										...p,
										titleEn: e.target.value
									}))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mata duree (Oromoo) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editing.titleOm,
									onChange: (e) => setEditing((p) => ({
										...p,
										titleOm: e.target.value
									}))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description (English)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: editing.descEn,
									onChange: (e) => setEditing((p) => ({
										...p,
										descEn: e.target.value
									})),
									rows: 3
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ibsa (Oromoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: editing.descOm,
									onChange: (e) => setEditing((p) => ({
										...p,
										descOm: e.target.value
									})),
									rows: 3
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [t("difficulty.easy"), " / Level"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: editing.level,
										onValueChange: (v) => setEditing((p) => ({
											...p,
											level: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "easy",
												children: t("difficulty.easy")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "medium",
												children: t("difficulty.medium")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "hard",
												children: t("difficulty.hard")
											})
										] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.status") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: editing.status,
										onValueChange: (v) => setEditing((p) => ({
											...p,
											status: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "draft",
												children: t("status.draft")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "active",
												children: t("status.active")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "archived",
												children: t("status.archived")
											})
										] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: editing.order ?? 0,
										onChange: (e) => setEditing((p) => ({
											...p,
											order: Number(e.target.value)
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setDialogOpen(false),
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => void save(),
								disabled: saving,
								children: saving ? t("common.saving") : t("common.save")
							})]
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { CoursesPage as component };
