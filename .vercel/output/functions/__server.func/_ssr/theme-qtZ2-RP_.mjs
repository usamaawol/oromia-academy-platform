import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-qtZ2-RP_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "oa.theme";
var Ctx = (0, import_react.createContext)(null);
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem(KEY);
		const initial = stored === "dark" || stored === "light" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		setThemeState(initial);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		window.localStorage.setItem(KEY, theme);
	}, [theme]);
	const toggle = (0, import_react.useCallback)(() => setThemeState((t) => t === "dark" ? "light" : "dark"), []);
	const setTheme = (0, import_react.useCallback)((t) => setThemeState(t), []);
	const value = (0, import_react.useMemo)(() => ({
		theme,
		toggle,
		setTheme
	}), [
		theme,
		toggle,
		setTheme
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
//#endregion
export { useTheme as n, ThemeProvider as t };
