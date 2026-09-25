import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./utils-DJzCcaxX.mjs";
import "../_libs/firebase.mjs";
import { d as doc, i as onSnapshot } from "../_libs/@firebase/firestore+[...].mjs";
import { n as getDb, t as firebaseReady } from "./firebase-Bve1OLnm.mjs";
import { o as useAuth } from "./auth-DVuTDe7t.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { W as redeemActivationCode, Y as useServerFn, z as getMyPendingCode } from "./server-fns-BeozUQqq.mjs";
import { $ as Copy, B as KeyRound, L as LoaderCircle, W as GraduationCap, ct as CircleCheck, g as ShieldOff, mt as Check, ot as CircleX, tt as Clock, w as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as serverErrorMessage } from "./server-error-CKBGMntn.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/waiting-for-approval-Cwfl9hsl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Waiting-for-Approval Page — /waiting-for-approval
*
* Shown to students who have registered but are not yet activated.
*
* State machine (mirrors activationStatus on the user profile):
*   pending   → "Waiting for admin approval" (no code shown)
*   approved  → "Approved! Your activation code is OA-XXXX-XXXX" + Activate button
*   rejected  → "Your request was not approved" + optional reason
*   suspended → "Your account has been suspended"
*   active    → redirect to /dashboard (already activated)
*
* Real-time: uses Firestore onSnapshot so the page auto-updates when admin
* approves or rejects without the student needing to refresh.
*
* Security: the raw activation code is fetched via a server function that
* verifies activationStatus === "approved" + userId match server-side.
* The browser never directly reads the activationCodeSecrets collection.
*/
function WaitingForApprovalPage() {
	const { lang } = useI18n();
	const { user, profile, loading, isActivated, refreshProfile } = useAuth();
	const navigate = useNavigate();
	const call = useServerFn();
	const [pageStatus, setPageStatus] = (0, import_react.useState)("loading");
	const [activationCode, setActivationCode] = (0, import_react.useState)(null);
	const [fetchingCode, setFetchingCode] = (0, import_react.useState)(false);
	const [rejectionReason, setRejectionReason] = (0, import_react.useState)(null);
	const [activating, setActivating] = (0, import_react.useState)(false);
	const [activated, setActivated] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const snapshotUnsub = (0, import_react.useRef)(null);
	const fetchCode = (0, import_react.useCallback)(async () => {
		if (!user) return;
		setFetchingCode(true);
		try {
			const result = await call(getMyPendingCode, void 0);
			if (result.code) setActivationCode(result.code);
		} catch (err) {
			console.error("Failed to fetch activation code:", err);
		} finally {
			setFetchingCode(false);
		}
	}, [user, call]);
	const updateFromStatus = (0, import_react.useCallback)(async (status, reason) => {
		const s = status ?? "pending";
		setPageStatus(s);
		if (s === "active") await navigate({ to: "/dashboard" });
		else if (s === "approved" && !activationCode) await fetchCode();
		if (reason !== void 0) setRejectionReason(reason ?? null);
	}, [
		activationCode,
		fetchCode,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!user) {
			navigate({ to: "/auth" });
			return;
		}
		if (isActivated) {
			navigate({ to: "/dashboard" });
			return;
		}
		const initStatus = profile?.activationStatus ?? "pending";
		setPageStatus(initStatus);
		if (initStatus === "rejected") setRejectionReason(profile?.rejectionReason ?? null);
		if (initStatus === "approved" && !activationCode) fetchCode();
		if (firebaseReady) {
			const db = getDb();
			const userRef = doc(db, "users", user.uid);
			snapshotUnsub.current = onSnapshot(userRef, (snap) => {
				if (!snap.exists()) return;
				const data = snap.data();
				const newStatus = data["activationStatus"];
				const reason = data["rejectionReason"];
				updateFromStatus(newStatus, reason);
				refreshProfile();
			}, (err) => {
				console.error("Profile snapshot error:", err);
			});
		}
		return () => {
			snapshotUnsub.current?.();
		};
	}, [loading, user]);
	const handleManualRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshProfile();
			const status = profile?.activationStatus ?? "pending";
			setPageStatus(status);
			if (status === "approved" && !activationCode) await fetchCode();
			if (status === "active") await navigate({ to: "/dashboard" });
		} finally {
			setRefreshing(false);
		}
	};
	const handleActivate = async () => {
		if (!activationCode) return;
		setActivating(true);
		try {
			if ((await call(redeemActivationCode, { code: activationCode })).ok) {
				setActivated(true);
				await refreshProfile();
				toast.success(lang === "om" ? "Herregni kee milkaa'inaan hojiiirra kaafame! Daashboordii kee baniisaa." : "Your account has been successfully activated! Opening your dashboard.");
				setTimeout(() => {
					navigate({ to: "/dashboard" });
				}, 1500);
			}
		} catch (err) {
			const msg = serverErrorMessage(err, { t: (k) => k });
			toast.error(lang === "om" ? `Dhiibbaa: ${msg}` : `Activation failed: ${msg}`);
		} finally {
			setActivating(false);
		}
	};
	const handleCopy = async () => {
		if (!activationCode) return;
		try {
			await navigator.clipboard.writeText(activationCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		} catch {}
	};
	if (loading || pageStatus === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center bg-background px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex flex-col items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-14 place-items-center rounded-2xl bg-primary/10 shadow-inner",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-8 text-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-bold tracking-tight",
					children: lang === "om" ? "Oromia Academy" : "Oromia Academy"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-soft",
				children: [
					pageStatus === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-16 place-items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-8 text-yellow-600 dark:text-yellow-400" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold",
								children: lang === "om" ? "Eeyyama Eegachaa Jirta" : "Waiting for Approval"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-muted-foreground",
								children: lang === "om" ? "Galmeen keessan milkaa'eera. Amma eeyyama bulchiinsa Oromia Academy eegaa jirtu." : "Your account has been created successfully. Please wait while an Oromia Academy administrator reviews your registration."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full rounded-xl bg-muted/50 px-4 py-3 text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-muted-foreground",
									children: lang === "om" ? "Imeelii:" : "Email:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-semibold",
									children: profile?.email
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm dark:border-yellow-800 dark:bg-yellow-900/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 shrink-0 text-yellow-600 dark:text-yellow-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-yellow-800 dark:text-yellow-300",
									children: lang === "om" ? "🟡 Eeyyama Eegachaa" : "🟡 Pending Approval"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: lang === "om" ? "Bulchiinsi yoo isin mirkaneesse, fuula kuni ofumaan ni haaromfama." : "This page will automatically update when an administrator reviews your request."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => void handleManualRefresh(),
								disabled: refreshing,
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-3.5", refreshing && "animate-spin") }), lang === "om" ? "Haaromsi" : "Refresh"]
							})
						]
					}),
					pageStatus === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-8 text-emerald-600 dark:text-emerald-400" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold",
								children: lang === "om" ? "🎉 Eeyyamame!" : "🎉 Your Account Is Approved!"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-muted-foreground",
								children: lang === "om" ? "Bulchiinsaan mirkanaameera. Koodii activation kee fayyadami herrega kee hojiirraa kaasuf." : "The administrator has approved your registration. Use your unique activation code below to activate your account."
							})] }),
							fetchingCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: lang === "om" ? "Koodii fe'aa jira..." : "Loading your code..."
								})]
							}) : activationCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: lang === "om" ? "Koodii Activation Kee" : "Your Activation Code"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex items-center justify-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-full rounded-2xl border-2 border-primary/30 bg-primary/5 px-6 py-5 font-mono text-3xl font-bold tracking-[0.25em] text-primary",
											children: activationCode
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											className: "absolute right-2 top-1/2 -translate-y-1/2",
											onClick: () => void handleCopy(),
											title: lang === "om" ? "Garagalchi" : "Copy",
											children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4 text-muted-foreground" })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted-foreground",
										children: lang === "om" ? "Koodiin kun herrega kee qofaaf kan qophaaye. Nama biraatti hin qoodin." : "This code is unique to your account. Do not share it with others."
									})
								]
							}), activated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-emerald-600 dark:text-emerald-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: lang === "om" ? "Milkaa'eera! Daashboordii banaa..." : "Activated! Opening dashboard..."
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90",
								size: "lg",
								onClick: () => void handleActivate(),
								disabled: activating,
								children: activating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), lang === "om" ? "Hojiirraa kaafamaa..." : "Activating..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4" }), lang === "om" ? "Herrega Hojiirraa Kaasi" : "Activate My Account"] })
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: lang === "om" ? "Koodiin argamuu dadhabde." : "Could not load your code."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => void fetchCode(),
									className: "gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), lang === "om" ? "Irra Deebi'i Yaalii" : "Try Again"]
								})]
							})
						]
					}),
					pageStatus === "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-16 place-items-center rounded-full bg-red-100 dark:bg-red-900/30",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-8 text-red-600 dark:text-red-400" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold",
								children: lang === "om" ? "Eeyyamni Didan" : "Registration Not Approved"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-muted-foreground",
								children: lang === "om" ? "Gaaffiin galmee keessan eeyyamame miti." : "Your registration request was not approved."
							})] }),
							rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm dark:border-red-800 dark:bg-red-900/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-red-800 dark:text-red-300",
									children: lang === "om" ? "Sababa:" : "Reason:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-red-700 dark:text-red-400",
									children: rejectionReason
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: lang === "om" ? "Odeeffannoo dabalataaf Oromia Academy bulchiinsa qunnami." : "Please contact Oromia Academy administration for more information."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => void handleManualRefresh(),
								disabled: refreshing,
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-3.5", refreshing && "animate-spin") }), lang === "om" ? "Haala Haaromsi" : "Refresh Status"]
							})
						]
					}),
					pageStatus === "suspended" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-6 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-16 place-items-center rounded-full bg-orange-100 dark:bg-orange-900/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-8 text-orange-600 dark:text-orange-400" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold",
							children: lang === "om" ? "Herregni Kee Dhaabbateera" : "Account Suspended"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted-foreground",
							children: lang === "om" ? "Herregni kee dhaabbateera. Oromia Academy bulchiinsa qunnami." : "Your account has been suspended. Please contact Oromia Academy administration."
						})] })]
					}),
					pageStatus === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-12 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: lang === "om" ? "Daashboordii banaa..." : "Redirecting to dashboard..."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs text-muted-foreground",
				children: "© 2026 Oromia Academy"
			})
		]
	});
}
//#endregion
export { WaitingForApprovalPage as component };
