import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime, d as DialogContent, f as DialogDescription, h as DialogTitle, k as Slot, l as Dialog, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "./_libs/class-variance-authority+clsx.mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { o as onAuthStateChanged } from "./_libs/firebase__auth.mjs";
import "./_libs/firebase.mjs";
import { r as getFirebaseAuth, t as firebaseReady } from "./_ssr/firebase-Bve1OLnm.mjs";
import { o as useAuth } from "./_ssr/auth-DVuTDe7t.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { _ as useNavigate, g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { F as claimOwner, H as getRankings, J as updateMyProfile, P as availableExams, U as myAttempts, V as getOwnerStatus, Y as useServerFn } from "./_ssr/server-fns-BeozUQqq.mjs";
import { I as Lock, J as FileText, M as Medal, O as PanelLeft, Q as Crown, R as LayoutDashboard, S as Save, X as EyeOff, Y as Eye, Z as Download, _ as ShieldCheck, _t as BookOpen, at as ClipboardCheck, d as TrendingUp, n as X, nt as Clock3, o as User, u as Trophy, vt as Bell, yt as Award } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
import { t as Separator } from "./_ssr/separator-xtkvXYpu.mjs";
import { t as SiteHeader } from "./_ssr/site-header-r2TkZ-J4.mjs";
import { n as listNotifications } from "./_ssr/data-BG6xX6_J.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "./_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authed.dashboard-CU9AH2xR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: 767px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var Sheet = Dialog;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 604800;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = import_react.createContext(null);
function useSidebar() {
	const context = import_react.useContext(SidebarContext);
	if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
	return context;
}
var SidebarProvider = import_react.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = import_react.useState(false);
	const [_open, _setOpen] = import_react.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = import_react.useCallback((value) => {
		const openState = typeof value === "function" ? value(open) : value;
		if (setOpenProp) setOpenProp(openState);
		else _setOpen(openState);
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}, [setOpenProp, open]);
	const toggleSidebar = import_react.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [
		isMobile,
		setOpen,
		setOpenMobile
	]);
	import_react.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);
	const state = open ? "expanded" : "collapsed";
	const contextValue = import_react.useMemo(() => ({
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	}), [
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
			delayDuration: 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					"--sidebar-width": SIDEBAR_WIDTH,
					"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
					...style
				},
				className: cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className),
				ref,
				...props,
				children
			})
		})
	});
});
SidebarProvider.displayName = "SidebarProvider";
var Sidebar = import_react.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	if (collapsible === "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", className),
		ref,
		...props,
		children
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: openMobile,
		onOpenChange: setOpenMobile,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			"data-sidebar": "sidebar",
			"data-mobile": "true",
			className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
			style: { "--sidebar-width": SIDEBAR_WIDTH_MOBILE },
			side,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "sr-only",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Sidebar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Displays the mobile sidebar." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-full flex-col",
				children
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "group peer hidden text-sidebar-foreground md:block",
		"data-state": state,
		"data-collapsible": state === "collapsed" ? collapsible : "",
		"data-variant": variant,
		"data-side": side,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className),
			...props,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-sidebar": "sidebar",
				className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
				children
			})
		})]
	});
});
Sidebar.displayName = "Sidebar";
var SidebarTrigger = import_react.forwardRef(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		ref,
		"data-sidebar": "trigger",
		variant: "ghost",
		size: "icon",
		className: cn("h-7 w-7", className),
		onClick: (event) => {
			onClick?.(event);
			toggleSidebar();
		},
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Toggle Sidebar"
		})]
	});
});
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = import_react.forwardRef(({ className, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		"data-sidebar": "rail",
		"aria-label": "Toggle Sidebar",
		tabIndex: -1,
		onClick: toggleSidebar,
		title: "Toggle Sidebar",
		className: cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className),
		...props
	});
});
SidebarRail.displayName = "SidebarRail";
var SidebarInset = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		ref,
		className: cn("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className),
		...props
	});
});
SidebarInset.displayName = "SidebarInset";
var SidebarInput = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		ref,
		"data-sidebar": "input",
		className: cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className),
		...props
	});
});
SidebarInput.displayName = "SidebarInput";
var SidebarHeader = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "header",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarHeader.displayName = "SidebarHeader";
var SidebarFooter = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "footer",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
});
SidebarFooter.displayName = "SidebarFooter";
var SidebarSeparator = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
		ref,
		"data-sidebar": "separator",
		className: cn("mx-2 w-auto bg-sidebar-border", className),
		...props
	});
});
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "content",
		className: cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
		...props
	});
});
SidebarContent.displayName = "SidebarContent";
var SidebarGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-sidebar": "group",
		className: cn("relative flex w-full min-w-0 flex-col p-2", className),
		...props
	});
});
SidebarGroup.displayName = "SidebarGroup";
var SidebarGroupLabel = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "div", {
		ref,
		"data-sidebar": "group-label",
		className: cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className),
		...props
	});
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
var SidebarGroupAction = import_react.forwardRef(({ className, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "group-action",
		className: cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarGroupAction.displayName = "SidebarGroupAction";
var SidebarGroupContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "group-content",
	className: cn("w-full text-sm", className),
	...props
}));
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu",
	className: cn("flex w-full min-w-0 flex-col gap-1", className),
	...props
}));
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	"data-sidebar": "menu-item",
	className: cn("group/menu-item relative", className),
	...props
}));
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring cursor-pointer transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var SidebarMenuButton = import_react.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();
	const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		ref,
		"data-sidebar": "menu-button",
		"data-size": size,
		"data-active": isActive,
		className: cn(sidebarMenuButtonVariants({
			variant,
			size
		}), className),
		...props
	});
	if (!tooltip) return button;
	if (typeof tooltip === "string") tooltip = { children: tooltip };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: button
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "right",
		align: "center",
		hidden: state !== "collapsed" || isMobile,
		...tooltip
	})] });
});
SidebarMenuButton.displayName = "SidebarMenuButton";
var SidebarMenuAction = import_react.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-sidebar": "menu-action",
		className: cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className),
		...props
	});
});
SidebarMenuAction.displayName = "SidebarMenuAction";
var SidebarMenuBadge = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	"data-sidebar": "menu-badge",
	className: cn("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuBadge.displayName = "SidebarMenuBadge";
var SidebarMenuSkeleton = import_react.forwardRef(({ className, showIcon = false, ...props }, ref) => {
	const width = import_react.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		"data-sidebar": "menu-skeleton",
		className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
		...props,
		children: [showIcon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "size-4 rounded-md",
			"data-sidebar": "menu-skeleton-icon"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
			className: "h-4 max-w-(--skeleton-width) flex-1",
			"data-sidebar": "menu-skeleton-text",
			style: { "--skeleton-width": width }
		})]
	});
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
var SidebarMenuSub = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
	ref,
	"data-sidebar": "menu-sub",
	className: cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className),
	...props
}));
SidebarMenuSub.displayName = "SidebarMenuSub";
var SidebarMenuSubItem = import_react.forwardRef(({ ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
	ref,
	...props
}));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = import_react.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "a", {
		ref,
		"data-sidebar": "menu-sub-button",
		"data-size": size,
		"data-active": isActive,
		className: cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className),
		...props
	});
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
/**
* One-time bootstrap: lets the first signed-in account on a fresh database
* claim the `owner` role so the admin panel can be reached. Only shows while
* no owner exists and the current account is still a student.
*/
function ClaimOwnerBanner() {
	const { t } = useI18n();
	const { profile, refreshProfile } = useAuth();
	const call = useServerFn();
	const navigate = useNavigate();
	const [hasOwner, setHasOwner] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		call(getOwnerStatus, void 0).then((r) => setHasOwner(Boolean(r?.hasOwner))).catch(() => setHasOwner(true));
	}, [call]);
	if (hasOwner === null || hasOwner) return null;
	if (profile?.role !== "student") return null;
	const handleClaim = async () => {
		setBusy(true);
		try {
			await call(claimOwner, void 0);
			await refreshProfile();
			toast.success(t("auth.ownerClaimed"));
			navigate({ to: "/admin" });
		} catch (err) {
			console.error("Failed to claim owner:", err);
			toast.error(t("auth.ownerExists"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		className: "mb-6 border-primary/40 bg-primary/5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: t("auth.ownerSetupTitle") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("auth.ownerSetupBody") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => void handleClaim(),
					disabled: busy,
					children: busy ? t("common.loading") : t("auth.claimOwner")
				})]
			})
		]
	});
}
/**
* Student dashboard — real Firebase data via server functions.
*/
function DashboardPage() {
	const { t, lang } = useI18n();
	const { profile, user, changePassword } = useAuth();
	useNavigate();
	const call = useServerFn();
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	const [exams, setExams] = (0, import_react.useState)([]);
	const [attempts, setAttempts] = (0, import_react.useState)([]);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [rankings, setRankings] = (0, import_react.useState)([]);
	const [rankingsPublished, setRankingsPublished] = (0, import_react.useState)(false);
	const [myRank, setMyRank] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [editingProfile, setEditingProfile] = (0, import_react.useState)(false);
	const [profileForm, setProfileForm] = (0, import_react.useState)({
		fullName: profile?.fullName ?? "",
		nickname: profile?.nickname ?? "",
		department: profile?.department ?? ""
	});
	const [passwordForm, setPasswordForm] = (0, import_react.useState)({
		currentPassword: "",
		newPassword: "",
		confirmPassword: ""
	});
	const [changingPassword, setChangingPassword] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		(async () => {
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
						setTimeout(() => {
							resolve();
						}, 4e3);
					});
				}
				const [e, a, n, rRaw] = await Promise.all([
					call(availableExams, void 0),
					call(myAttempts, void 0),
					listNotifications(user.uid),
					call(getRankings, void 0)
				]);
				const r = rRaw;
				setExams(e);
				setAttempts(a);
				setNotifications(n);
				setRankings(r.all);
				setRankingsPublished(r.rankingsPublished);
				setMyRank(r.myRank);
			} catch (err) {
				console.error(err);
				const msg = String(err?.message ?? "");
				if (!msg.includes("auth/required") && !msg.includes("session")) toast.error(serverErrorMessage(err, t));
			} finally {
				setLoading(false);
			}
		})();
	}, [user]);
	const completedAttempts = attempts.filter((a) => a.status !== "in_progress");
	const publishedResults = attempts.filter((a) => a.published);
	const handleSaveProfile = async () => {
		try {
			if (!profile) return;
			if (!profileForm.fullName.trim()) {
				toast.error("Full name is required");
				return;
			}
			await call(updateMyProfile, {
				fullName: profileForm.fullName,
				nickname: profileForm.nickname,
				department: profileForm.department
			});
			toast.success("Profile updated successfully");
			setEditingProfile(false);
		} catch (err) {
			console.error(err);
			toast.error("Failed to update profile");
		}
	};
	const handleChangePassword = async () => {
		if (!changePassword) return;
		if (passwordForm.newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setChangingPassword(true);
		try {
			await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
			toast.success("Password changed successfully");
			setPasswordForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: ""
			});
		} catch (err) {
			console.error(err);
			const code = err?.code ?? "";
			if (code.includes("wrong-password") || code.includes("invalid-credential")) toast.error("Current password is incorrect");
			else if (code.includes("weak-password")) toast.error("New password is too weak");
			else toast.error("Failed to change password");
		} finally {
			setChangingPassword(false);
		}
	};
	const handleDownloadResult = (attempt) => {
		const content = [
			"======================================",
			"       OROMIA ACADEMY — EXAM RESULT   ",
			"======================================",
			"",
			`Student   : ${attempt.studentName}`,
			`Exam      : ${attempt.examTitle}`,
			`Attempt # : ${attempt.attemptNumber}`,
			`Date      : ${new Date(attempt.submittedAt ?? Date.now()).toLocaleString()}`,
			"",
			"--------------------------------------",
			"  SCORE SUMMARY",
			"--------------------------------------",
			`  Total Points : ${attempt.totalPoints}`,
			`  Your Score   : ${attempt.autoScore + attempt.manualScore}`,
			`  Percentage   : ${attempt.percentage}%`,
			`  Result       : ${attempt.passed ? "✅ PASSED" : "❌ FAILED"}`,
			"",
			"  Breakdown:",
			`  ✓ Correct    : ${attempt.correctCount}`,
			`  ✗ Wrong      : ${attempt.wrongCount}`,
			`  - Unanswered : ${attempt.unansweredCount}`,
			"",
			"--------------------------------------",
			"  Oromia Academy — oromiaacademy.com  ",
			"======================================"
		].join("\n");
		const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `OromiaAcademy-Result-${attempt.examTitle.replace(/\s+/g, "_")}-${attempt.id.slice(0, 8)}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sidebar, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarHeader, {
					className: "border-b border-sidebar-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-2 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: "Oromia Academy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Student Portal"
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupLabel, { children: "Menu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenu, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
						isActive: activeTab === "overview",
						onClick: () => setActiveTab("overview"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Overview" })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
						isActive: activeTab === "exams",
						onClick: () => setActiveTab("exams"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Available Exams" }),
							exams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "ml-auto",
								children: exams.length
							})
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
						isActive: activeTab === "attempts",
						onClick: () => setActiveTab("attempts"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "My Exams" }),
							attempts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "ml-auto",
								children: attempts.length
							})
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
						isActive: activeTab === "results",
						onClick: () => setActiveTab("results"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "My Results" }),
							publishedResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "ml-auto",
								children: publishedResults.length
							})
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
						isActive: activeTab === "profile",
						onClick: () => setActiveTab("profile"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "My Info" })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarMenuItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarMenuButton, {
						isActive: activeTab === "ranking",
						onClick: () => setActiveTab("ranking"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "My Ranking" }),
							myRank && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "ml-auto",
								children: ["#", myRank.rank]
							})
						]
					}) })
				] }) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupLabel, { children: "Rankings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarGroupContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 py-2",
					children: myRank ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-accent/50 to-accent p-4 shadow-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow",
								children: myRank.rank === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "size-6" }) : myRank.rank <= 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Medal, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-6" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
										children: rankingsPublished ? "Public Rank" : "Your Rank"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-3xl font-black leading-none mt-0.5",
										children: ["#", myRank.rank]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "inline-flex items-center gap-1",
												children: rankingsPublished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" }), " Public"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3" }), " Private"] })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [myRank.avgScore, "% avg"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												myRank.examCount,
												" exam",
												myRank.examCount !== 1 ? "s" : ""
											] })
										]
									})
								]
							})]
						}), !rankingsPublished && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[11px] leading-relaxed text-muted-foreground/90 border-t border-border/50 pt-3",
							children: "Rankings are not yet published by the admin. Only you can see your rank."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-dashed border-border p-3 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mx-auto size-5 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-xs text-muted-foreground",
							children: "Complete and publish exams to get your rank"
						})]
					})
				}) })] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarFooter, {
					className: "border-t border-sidebar-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-2 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-8 items-center justify-center rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: profile?.fullName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: profile?.email
							})]
						})]
					})
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 px-4 py-6 md:px-8 md:py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-primary",
								children: t("common.academy")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-1 text-3xl font-bold",
								children: [
									t("dash.greeting"),
									", ",
									profile?.fullName?.split(" ")[0] ?? ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: t("dash.title")
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarTrigger, { className: "md:hidden" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimOwnerBanner, {}),
					activeTab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 sm:grid-cols-4",
							children: [
								[
									BookOpen,
									t("dash.myCourses"),
									profile?.enrolledCourseIds?.length ?? 0,
									"text-blue-500"
								],
								[
									ClipboardCheck,
									t("dash.availableExams"),
									exams.length,
									"text-green-500"
								],
								[
									Trophy,
									t("dash.completedExams"),
									completedAttempts.length,
									"text-yellow-500"
								],
								[
									Bell,
									t("dash.notifications"),
									notifications.length,
									"text-purple-500"
								]
							].map(([Icon, label, value, color]) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-5 ${color}` }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4 text-3xl font-bold",
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: t("dash.availableExams")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3",
								children: loading ? Array.from({ length: 2 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }, i)) : exams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: t("dash.noExams")
								}) : exams.map((exam) => {
									const prevAttempts = attempts.filter((a) => a.examId === exam.id);
									const inProgress = prevAttempts.find((a) => a.status === "in_progress");
									const attemptsUsed = prevAttempts.length;
									const attemptsLeft = exam.maxAttempts > 0 ? exam.maxAttempts - attemptsUsed : null;
									const canTake = attemptsLeft === null || attemptsLeft > 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
													className: "font-semibold",
													children: exam.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }),
																exam.durationMin,
																" ",
																t("common.minutes")
															]
														}),
														exam.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "flex items-center gap-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }),
																" ",
																t("exam.password")
															]
														}),
														attemptsLeft !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															attemptsLeft,
															" ",
															t("exam.attemptsLeft")
														] })
													]
												})]
											}),
											canTake ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/exam/$examId",
													params: { examId: exam.id },
													children: inProgress ? t("exam.resume") : t("dash.startExam")
												})
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												children: t("exam.noAttemptsLeft")
											})
										]
									}, exam.id);
								})
							})]
						}),
						publishedResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: t("dash.results")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3",
								children: publishedResults.map((attempt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-semibold",
											children: attempt.examTitle
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: [
												attempt.percentage,
												"% ·",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: attempt.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
													children: attempt.passed ? t("result.passed") : t("result.failed")
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/result/$attemptId",
											params: { attemptId: attempt.id },
											children: t("dash.viewResult")
										})
									})]
								}, attempt.id))
							})]
						}),
						notifications.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: t("common.notifications")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3",
								children: notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border bg-card p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: lang === "om" ? n.titleOm : n.titleEn
									}), (lang === "om" ? n.bodyOm : n.bodyEn) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: lang === "om" ? n.bodyOm : n.bodyEn
									})]
								}, n.id))
							})]
						})
					] }),
					activeTab === "exams" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "Available Exams"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }) : exams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: t("dash.noExams")
						}) : exams.map((exam) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold",
										children: exam.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }),
												exam.durationMin,
												" ",
												t("common.minutes")
											]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/exam/$examId",
										params: { examId: exam.id },
										children: t("dash.startExam")
									})
								})
							]
						}, exam.id))
					})] }),
					activeTab === "attempts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "My Exam Attempts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }) : attempts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "No exam attempts yet."
						}) : attempts.map((attempt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: attempt.examTitle
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [
										"Status: ",
										attempt.status,
										" · Attempt #",
										attempt.attemptNumber
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: attempt.status === "in_progress" ? "default" : "secondary",
								children: attempt.status
							})]
						}, attempt.id))
					})] }),
					activeTab === "results" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "My Results"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }) : publishedResults.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "No published results yet."
						}) : publishedResults.map((attempt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: attempt.examTitle
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [
										attempt.percentage,
										"% ·",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: attempt.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
											children: attempt.passed ? t("result.passed") : t("result.failed")
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => handleDownloadResult(attempt),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Download"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/result/$attemptId",
										params: { attemptId: attempt.id },
										children: t("dash.viewResult")
									})
								})]
							})]
						}, attempt.id))
					})] }),
					activeTab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: "My Info"
							}), !editingProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									setProfileForm({
										fullName: profile?.fullName ?? "",
										nickname: profile?.nickname ?? "",
										department: profile?.department ?? ""
									});
									setEditingProfile(true);
								},
								children: "Edit"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setEditingProfile(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleSaveProfile,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), "Save"]
								})]
							})]
						}),
						!profile?.nickname && !editingProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-4 flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg shrink-0",
									children: "🎭"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-sm",
										children: "Set your anonymous nickname"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Your nickname is shown on public exam leaderboards instead of your real name. It keeps your identity private while still showing your rank."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setProfileForm({
											fullName: profile?.fullName ?? "",
											nickname: "",
											department: profile?.department ?? ""
										});
										setEditingProfile(true);
									},
									children: "Set nickname"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "fullName",
											children: "Full Name"
										}), editingProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "fullName",
											value: profileForm.fullName,
											onChange: (e) => setProfileForm({
												...profileForm,
												fullName: e.target.value
											}),
											className: "mt-1"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: profile?.fullName
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											htmlFor: "nickname",
											children: [
												"Anonymous Nickname",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted-foreground font-normal",
													children: "(shown on leaderboards)"
												})
											]
										}), editingProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "nickname",
											value: profileForm.nickname,
											placeholder: "e.g. StarCoder99, TechWiz, ProLearner",
											onChange: (e) => setProfileForm({
												...profileForm,
												nickname: e.target.value
											}),
											className: "mt-1"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: profile?.nickname || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "italic text-amber-600",
												children: "Not set — your rank will show as \"StudentXXX\""
											})
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "department",
											children: "Department"
										}), editingProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "department",
											value: profileForm.department,
											onChange: (e) => setProfileForm({
												...profileForm,
												department: e.target.value
											}),
											className: "mt-1"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: profile?.department || "Not set"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-muted-foreground",
												children: profile?.email
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground/60",
												children: "Email cannot be changed"
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground capitalize",
											children: profile?.role
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Enrolled Courses" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: [profile?.enrolledCourseIds?.length ?? 0, " course(s)"]
										})] })
									]
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Change Password"]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "currentPassword",
											children: "Current Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "currentPassword",
											type: "password",
											value: passwordForm.currentPassword,
											onChange: (e) => setPasswordForm({
												...passwordForm,
												currentPassword: e.target.value
											}),
											className: "mt-1",
											autoComplete: "current-password"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "newPassword",
											children: "New Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "newPassword",
											type: "password",
											value: passwordForm.newPassword,
											onChange: (e) => setPasswordForm({
												...passwordForm,
												newPassword: e.target.value
											}),
											className: "mt-1",
											autoComplete: "new-password"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "confirmPassword",
											children: "Confirm New Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "confirmPassword",
											type: "password",
											value: passwordForm.confirmPassword,
											onChange: (e) => setPasswordForm({
												...passwordForm,
												confirmPassword: e.target.value
											}),
											className: "mt-1",
											autoComplete: "new-password"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											onClick: handleChangePassword,
											disabled: changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword,
											className: "mt-2 w-fit",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-2 size-4" }), changingPassword ? "Changing..." : "Change Password"]
										})
									]
								})
							})]
						})
					] }),
					activeTab === "ranking" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-2xl font-bold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-6 text-primary" }), "Student Rankings"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: rankingsPublished ? "Global rankings are published — compete fairly!" : "Only you can view your rank. Admin may publish rankings soon."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: rankingsPublished ? "default" : "secondary",
								className: "w-fit flex items-center gap-1",
								children: rankingsPublished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" }), " Published"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3" }), " Private"] })
							})]
						}),
						myRank && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "mb-6 overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid md:grid-cols-[1fr_auto] gap-6 p-6 md:p-8",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid size-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow",
											children: myRank.rank === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "size-10" }) : myRank.rank <= 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Medal, { className: "size-10" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-10" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground",
												children: "Your Position"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 flex items-baseline gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-6xl font-black leading-none tracking-tight",
													children: ["#", myRank.rank]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-lg font-semibold text-muted-foreground",
													children: ["of ", rankingsPublished ? rankings.length : "all students"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 flex flex-wrap gap-4 text-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2 rounded-full bg-muted px-3 py-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold",
															children: [myRank.avgScore, "%"]
														}), " average"] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2 rounded-full bg-muted px-3 py-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-bold",
															children: myRank.examCount
														}), " completed"] })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex items-center gap-2 rounded-full bg-muted px-3 py-1.5",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-sm font-semibold",
															children: myRank.rank === 1 ? "🏆 Top Performer!" : myRank.rank <= 3 ? "🎯 Top 3!" : myRank.rank <= 10 ? "⭐ Top 10!" : "💪 Keep going!"
														})
													})
												]
											})
										] })]
									})
								})
							})
						}),
						!rankingsPublished && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20 p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-5 text-amber-600 dark:text-amber-400" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-amber-900 dark:text-amber-300",
										children: "Rankings are currently private"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-amber-800/90 dark:text-amber-300/80",
										children: "Only you can see your rank. When the academy admin publishes the official leaderboard, you'll be able to compare yourself with other students using anonymous nicknames."
									})]
								})]
							})
						}),
						rankingsPublished && rankings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "border-b bg-muted/50",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-left w-20 font-medium text-muted-foreground",
												children: "Rank"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-left font-medium text-muted-foreground",
												children: "Student"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell",
												children: "Exams"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-right font-medium text-muted-foreground",
												children: "Avg Score"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y",
										children: rankings.map((r) => {
											const isMe = r.id === user?.uid;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: isMe ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/30",
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
																className: cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold", isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
																children: r.nickname[0]?.toUpperCase() ?? "?"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-semibold",
																children: [r.nickname, isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "ml-2 border-primary/50 text-primary text-[10px] h-5",
																	children: "YOU"
																})]
															}) })]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "hidden px-4 py-3 text-muted-foreground sm:table-cell",
														children: r.examCount
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3 text-right",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: cn("font-bold", r.avgScore >= 80 ? "text-green-600 dark:text-green-400" : r.avgScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"),
															children: [r.avgScore, "%"]
														})
													})
												]
											}, r.rank + "-" + r.nickname);
										})
									})]
								})
							})
						}) }) : rankingsPublished && rankings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-10 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mx-auto size-10 text-muted-foreground/40" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-semibold",
									children: "No rankings yet"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Complete some published exams to appear on the leaderboard."
								})
							]
						}) }) : null
					] })
				]
			})]
		})]
	}) });
}
//#endregion
export { DashboardPage as component };
