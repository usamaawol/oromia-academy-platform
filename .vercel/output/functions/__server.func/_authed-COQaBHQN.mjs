import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { o as useAuth } from "./_ssr/auth-DVuTDe7t.mjs";
import { _ as useNavigate, f as Outlet, l as useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authed-COQaBHQN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Layout route that redirects unauthenticated users to /auth.
* All protected pages nest under this route.
* Staff users (owner/admin/instructor) are redirected to the admin panel.
*
* Student routing by activationStatus:
*   pending  → /waiting-for-approval
*   approved → /waiting-for-approval  (code shown there, they activate from that page)
*   rejected → /waiting-for-approval  (rejection message shown)
*   active   → allowed into dashboard
*   suspended → /waiting-for-approval (suspension message shown)
*/
function AuthedLayout() {
	const { user, isStaff, loading, isActivated, activationStatus } = useAuth();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!user) {
			navigate({ to: "/auth" });
			return;
		}
		if (isStaff) {
			navigate({ to: "/admin" });
			return;
		}
		if (!isActivated && !["/activate", "/waiting-for-approval"].includes(pathname)) navigate({ to: "/waiting-for-approval" });
	}, [
		user,
		isStaff,
		loading,
		isActivated,
		activationStatus,
		pathname,
		navigate
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" })
	});
	if (!user || isStaff) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
//#endregion
export { AuthedLayout as component };
