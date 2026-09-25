import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./utils-DJzCcaxX.mjs";
import { o as onAuthStateChanged } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { r as getFirebaseAuth, t as firebaseReady } from "./firebase-Bve1OLnm.mjs";
import { o as useAuth } from "./auth-DVuTDe7t.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { W as redeemActivationCode, Y as useServerFn } from "./server-fns-BeozUQqq.mjs";
import { B as KeyRound, L as LoaderCircle, W as GraduationCap, ct as CircleCheck, lt as CircleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate-aHgyz4eG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Student Activation Page — /activate
*
* A student must redeem a valid activation code issued by Oromia Academy
* before they can access the Student Dashboard.
*
* Security: The actual validation runs entirely on the server (server fn).
* No local/session storage, no frontend boolean, no hidden button tricks.
*/
function activationErrorMessage(err, lang) {
	const msg = String(err?.message ?? "");
	const code = String(err?.code ?? msg);
	const map = lang === "om" ? {
		"activation/invalid-code": "Koodiin kun sirrii miti.",
		"activation/code-used": "Koodiin kun duraan hojii irra ooleera.",
		"activation/code-revoked": "Koodiin kun haqameera.",
		"activation/code-expired": "Koodiin kun yeroo isaa darbeera.",
		"activation/code-wrong-user": "Koodiin kun herrega kanaaf hin ramadamne.",
		"activation/account-locked": "Herregni kee dhaabbateera. Admin qunnami.",
		"activation/already-active": "Herregni kee duraan hojii irra jira.",
		"activation/not-approved": "Herregni kee amma eeyyamame miti. Bulchiinsa eegi.",
		"auth/required": "Maaloo dursii seeni.",
		"auth/suspended": "Herregni kee dhaabbateera."
	} : {
		"activation/invalid-code": "This code is invalid.",
		"activation/code-used": "This code has already been used.",
		"activation/code-revoked": "This code has been revoked.",
		"activation/code-expired": "This code has expired.",
		"activation/code-wrong-user": "This code is not assigned to your account.",
		"activation/account-locked": "Your account is locked. Contact the admin.",
		"activation/already-active": "Your account is already activated.",
		"activation/not-approved": "Your account has not been approved yet. Please wait for admin review.",
		"auth/required": "Please sign in first.",
		"auth/suspended": "Your account has been suspended."
	};
	if (map[code]) return map[code];
	for (const [k, v] of Object.entries(map)) if (code.includes(k) || msg.includes(k)) return v;
	return lang === "om" ? "Rakkoon network uumame. Mee irra deebi'ii yaali." : "A network error occurred. Please try again.";
}
function CodeInput({ value, onChange, disabled }) {
	const inputRef = (0, import_react.useRef)(null);
	function handleChange(e) {
		let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
		if (raw.length > 0 && !raw.startsWith("OA")) raw = "OA" + raw;
		let out = "";
		if (raw.length >= 2) {
			out = raw.slice(0, 2);
			if (raw.length > 2) {
				out += "-" + raw.slice(2, 6);
				if (raw.length > 6) out += "-" + raw.slice(6, 10);
			}
		} else out = raw;
		onChange(out);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref: inputRef,
		type: "text",
		inputMode: "text",
		autoComplete: "off",
		autoCorrect: "off",
		autoCapitalize: "characters",
		spellCheck: false,
		placeholder: "OA-____-____",
		value,
		onChange: handleChange,
		disabled,
		maxLength: 12,
		className: cn("w-full rounded-2xl border-2 border-border bg-background px-6 py-5 text-center", "font-mono text-2xl font-bold tracking-[0.25em] uppercase text-foreground", "placeholder:text-muted-foreground/40 placeholder:tracking-[0.25em]", "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20", "disabled:opacity-50 disabled:cursor-not-allowed", "transition-all duration-200")
	});
}
function ActivatePage() {
	const { lang } = useI18n();
	const { user, profile, loading, refreshProfile, isActivated } = useAuth();
	const navigate = useNavigate();
	const call = useServerFn();
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [activated, setActivated] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!loading && isActivated) navigate({ to: "/dashboard" });
	}, [
		loading,
		isActivated,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({ to: "/auth" });
	}, [
		loading,
		user,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (!loading && user && !isActivated) {
			const s = profile?.activationStatus;
			if (s === "pending" || s === "rejected" || s === "suspended") navigate({ to: "/waiting-for-approval" });
		}
	}, [
		loading,
		user,
		isActivated,
		profile,
		navigate
	]);
	async function handleSubmit(e) {
		e.preventDefault();
		const trimmed = code.trim().toUpperCase();
		if (!trimmed || trimmed.length < 8) {
			setError(lang === "om" ? "Koodii sirrii galchi (fakkeenyaaf: OA-A7K9-P2XM)." : "Enter a valid code (e.g. OA-A7K9-P2XM).");
			return;
		}
		setError(null);
		setBusy(true);
		try {
			if (firebaseReady) {
				const auth = getFirebaseAuth();
				if (!auth.currentUser) await new Promise((resolve) => {
					const unsub = onAuthStateChanged(auth, (u) => {
						if (u) {
							unsub();
							resolve();
						}
					});
					setTimeout(() => resolve(), 4e3);
				});
			}
			await call(redeemActivationCode, { code: trimmed });
			await refreshProfile();
			setActivated(true);
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 2e3);
		} catch (err) {
			setError(activationErrorMessage(err, lang));
		} finally {
			setBusy(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" })
	});
	if (!user) return null;
	if (activated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-6 text-center max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-12 text-emerald-600 dark:text-emerald-400" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-foreground",
					children: lang === "om" ? "Baga milkaa'ite!" : "Activation successful!"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: lang === "om" ? "Herregni kee hojii irra ooleera. Daashboordii kee banuuf eeggadhu..." : "Your account is now activated. Opening your dashboard..."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-1 w-32 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full animate-[slide_1s_ease-in-out_infinite] rounded-full bg-emerald-500" })
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-16 items-center gap-3 border-b border-border/60 bg-card/50 px-4 backdrop-blur-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-9 items-center justify-center rounded-xl bg-primary/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-5 text-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-sm",
					children: "Oromia Academy"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ml-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "Oromia Academy"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex flex-1 flex-col items-center justify-center px-4 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 flex flex-col items-center gap-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-20 items-center justify-center rounded-3xl bg-primary/10 shadow-lg shadow-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-10 text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-1 -top-1 size-5 rounded-full bg-primary" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold leading-tight text-foreground",
								children: lang === "om" ? "Herrega Kee Haa Hojiirra Oolu" : "Activate Your Account"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: lang === "om" ? "Herregni kee milkaa'inaan uumameera. Daashboordii Barataa seenuuf, koodii activation Oromia Academy irraa argatte galchi." : "Your account has been created successfully. To access the Student Dashboard, enter the activation code provided by Oromia Academy."
							})] }),
							profile?.fullName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground grid place-items-center",
									children: profile.fullName[0]?.toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-foreground",
									children: profile.fullName
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-3xl border border-border/60 bg-card p-6 shadow-xl shadow-black/5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => void handleSubmit(e),
							className: "flex flex-col gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-sm font-semibold text-foreground",
											children: lang === "om" ? "Koodii Activation" : "Activation Code"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeInput, {
											value: code,
											onChange: setCode,
											disabled: busy
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground text-center",
											children: lang === "om" ? "Fakkeenya: OA-A7K9-P2XM" : "Example: OA-A7K9-P2XM"
										})
									]
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-destructive",
										children: error
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "lg",
									disabled: busy || code.length < 8,
									className: "w-full rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/25",
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), lang === "om" ? "Madaalaa jira..." : "Validating..."]
									}) : lang === "om" ? "Herrega Haa Hojiirra Oolu" : "Activate Account"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 rounded-2xl border border-border/60 bg-muted/30 p-5 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-foreground",
								children: lang === "om" ? "Koodii hin qabduu?" : "Don't have an activation code?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: lang === "om" ? "Admin Telegram irratti qunnami:" : "Contact the admin on Telegram:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://t.me/SuufiyaanBJICS",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									viewBox: "0 0 24 24",
									className: "size-4 fill-current",
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" })
								}), "@SuufiyaanBJICS"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: lang === "om" ? "Koodiin kun Oromia Academy'n barattoota isaaf qofa kennamaadha." : "Activation codes are issued exclusively by Oromia Academy."
					})
				]
			})
		})]
	});
}
//#endregion
export { ActivatePage as component };
