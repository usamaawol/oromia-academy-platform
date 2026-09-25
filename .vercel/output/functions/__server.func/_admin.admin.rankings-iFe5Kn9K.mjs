import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { o as useAuth } from "./_ssr/auth-DVuTDe7t.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { H as getRankings, N as adminUnpublishRankings, Y as useServerFn, x as adminPublishRankings } from "./_ssr/server-fns-BeozUQqq.mjs";
import { M as Medal, P as Mail, Q as Crown, X as EyeOff, Y as Eye, a as Users, at as ClipboardCheck, d as TrendingUp, u as Trophy, w as RefreshCw, x as Search, yt as Award } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.rankings-iFe5Kn9K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Student Rankings / Leaderboard
*/
function AdminRankingsPage() {
	const { t } = useI18n();
	const { profile: myProfile } = useAuth();
	const call = useServerFn();
	const [rankings, setRankings] = (0, import_react.useState)([]);
	const [rankingsPublished, setRankingsPublished] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [publishing, setPublishing] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const refresh = async () => {
		setLoading(true);
		try {
			const data = await call(getRankings, void 0);
			setRankings(data.all);
			setRankingsPublished(data.rankingsPublished);
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	const filtered = rankings.filter((r) => {
		const q = query.trim().toLowerCase();
		if (!q) return true;
		return r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.nickname.toLowerCase().includes(q) || String(r.rank).includes(q);
	});
	const handlePublish = async (publish) => {
		setPublishing(true);
		try {
			if (publish) {
				await call(adminPublishRankings, void 0);
				toast.success("Rankings published! Students can now view the leaderboard.");
			} else {
				await call(adminUnpublishRankings, void 0);
				toast.success("Rankings unpublished. Only students' personal ranks are visible.");
			}
			setRankingsPublished(publish);
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setPublishing(false);
		}
	};
	const totalStudents = rankings.length;
	const withScores = rankings.filter((r) => r.examCount > 0).length;
	const avgAcrossBoard = withScores > 0 ? Math.round(rankings.reduce((s, r) => s + r.avgScore, 0) / withScores) : 0;
	const topScore = rankings[0]?.avgScore ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 text-2xl font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-6 text-primary" }), t("common.leaderboard")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Full view of student rankings with real names. Use the publish toggle to share a nickname-only leaderboard with students."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: rankingsPublished ? "default" : "secondary",
						className: "flex items-center gap-1 px-3 py-1",
						children: rankingsPublished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), " Published to students"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" }), " Visible to staff only"] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => void refresh(),
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4 mr-1.5", loading && "animate-spin") }), "Refresh"]
					}),
					rankingsPublished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "destructive",
						onClick: () => void handlePublish(false),
						disabled: publishing,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "mr-1.5 size-4" }), publishing ? "Unpublishing..." : "Unpublish Rankings"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => void handlePublish(true),
						disabled: publishing,
						className: "bg-green-600 hover:bg-green-700 text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1.5 size-4" }), publishing ? "Publishing..." : "Publish Rankings"]
					})
				]
			})]
		}),
		rankingsPublished && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 rounded-xl border border-green-300 bg-green-50 dark:border-green-800/60 dark:bg-green-950/20 p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-9 shrink-0 place-items-center rounded-lg bg-green-100 dark:bg-green-900/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4 text-green-700 dark:text-green-400" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-green-900 dark:text-green-300",
						children: "Leaderboard is live"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-sm text-green-800/90 dark:text-green-300/90",
						children: "Students can now compare rankings anonymously. Only nicknames are visible — no real names or emails are shared. You can revoke access at any time."
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 grid gap-4 sm:grid-cols-4",
			children: [
				[
					Users,
					"Total students",
					totalStudents,
					"text-blue-500"
				],
				[
					ClipboardCheck,
					"With completed exams",
					withScores,
					"text-green-500"
				],
				[
					Award,
					"Class average",
					`${avgAcrossBoard}%`,
					"text-purple-500"
				],
				[
					Trophy,
					"Top score",
					`${topScore}%`,
					"text-amber-500"
				]
			].map(([Icon, label, value, color]) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-5 mb-3 ${color}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold tracking-tight",
							children: loading ? "—" : String(value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-sm text-muted-foreground",
							children: String(label)
						})
					]
				}) }, String(label));
			})
		}),
		rankings.length > 0 && rankings[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 grid gap-4 md:grid-cols-3",
			children: rankings.slice(0, 3).map((r, idx) => {
				const m = [
					{
						bg: "from-yellow-400 to-amber-500",
						fg: "text-yellow-950",
						ring: "ring-yellow-300",
						icon: Crown
					},
					{
						bg: "from-slate-300 to-slate-400",
						fg: "text-slate-900",
						ring: "ring-slate-300",
						icon: Medal
					},
					{
						bg: "from-orange-400 to-amber-600",
						fg: "text-orange-950",
						ring: "ring-orange-300",
						icon: Medal
					}
				][idx];
				const Icon = m.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: cn("overflow-hidden", idx === 0 && "md:scale-[1.02] md:z-10 ring-2 ring-offset-2", idx === 0 && `ring-amber-300 dark:ring-amber-700`),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: `bg-gradient-to-br ${m.bg} p-6 ${m.fg}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold uppercase tracking-widest opacity-80",
									children: [
										"#",
										idx + 1,
										" Place"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-7" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-14 shrink-0 place-items-center rounded-2xl bg-white/30 backdrop-blur-sm text-xl font-black ring-2 ring-white/40",
									children: r.fullName[0]?.toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-lg font-bold leading-tight",
										children: r.fullName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs opacity-80 flex items-center gap-1 mt-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" }),
											" ",
											r.email
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-white/25 px-3 py-2 ring-1 ring-white/30 backdrop-blur-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-bold uppercase opacity-75",
										children: "Average"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-2xl font-black leading-tight",
										children: [r.avgScore, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-white/25 px-3 py-2 ring-1 ring-white/30 backdrop-blur-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-bold uppercase opacity-75",
										children: "Exams"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-2xl font-black leading-tight",
										children: r.examCount
									})]
								})]
							})
						]
					})
				}, r.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search by name, email, nickname or rank...",
					className: "w-full sm:w-80 pl-9",
					value: query,
					onChange: (e) => setQuery(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ml-auto text-sm text-muted-foreground",
				children: [
					"Showing ",
					filtered.length,
					" of ",
					rankings.length,
					" students"
				]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-lg border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "w-20 px-4 py-3 text-left font-medium text-muted-foreground",
								children: "Rank"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left font-medium text-muted-foreground",
								children: "Student"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell",
								children: "Nickname"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell",
								children: "Email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "w-24 px-4 py-3 text-center font-medium text-muted-foreground",
								children: "Exams"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "w-32 px-4 py-3 text-right font-medium text-muted-foreground",
								children: "Avg Score"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y",
						children: filtered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: cn("hover:bg-muted/30", r.id === myProfile?.id && "bg-primary/5 dark:bg-primary/10"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("grid size-8 place-items-center rounded-lg text-sm font-black", r.rank === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : r.rank === 2 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" : r.rank === 3 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" : "bg-muted text-muted-foreground"),
											children: r.rank
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold", r.rank <= 3 ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"),
											children: r.fullName[0]?.toUpperCase()
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold leading-tight truncate",
												children: [r.fullName, r.id === myProfile?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "ml-2 h-5 border-primary/50 text-primary text-[10px]",
													children: "YOU"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "md:hidden truncate text-xs text-muted-foreground flex items-center gap-1 mt-0.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" }),
													" ",
													r.email
												]
											})]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "hidden px-4 py-3 md:table-cell",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1 text-xs font-medium text-accent-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3 text-primary" }), r.nickname]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "hidden px-4 py-3 text-muted-foreground lg:table-cell",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 opacity-60" }), r.email]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-semibold min-w-[2.5rem]",
										children: r.examCount
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center justify-end gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("text-lg font-black tracking-tight tabular-nums", r.avgScore >= 80 ? "text-green-600 dark:text-green-400" : r.avgScore >= 50 ? "text-amber-600 dark:text-amber-400" : r.avgScore > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"),
											children: [r.avgScore, "%"]
										})
									})
								})
							]
						}, r.id))
					})]
				}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mx-auto size-10 text-muted-foreground/30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-medium text-muted-foreground",
							children: query ? "No students match your search." : "No ranking data yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground/80",
							children: "Once students complete published exams, their rankings will appear here."
						})
					]
				})]
			})
		}) })
	] });
}
//#endregion
export { AdminRankingsPage as component };
