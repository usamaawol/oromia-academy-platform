import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.index-D_CuKoEe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Admin root — redirects /admin to /admin/exams.
*/
function AdminOverview() {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		navigate({
			to: "/admin/exams",
			replace: true
		});
	}, [navigate]);
	return null;
}
//#endregion
export { AdminOverview as component };
