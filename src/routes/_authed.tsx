/**
 * Layout route that protects STUDENT-only pages.
 *
 *   - loading                → show spinner, NEVER redirect
 *   - no user                → /auth
 *   - user is staff          → /admin (staff should be in the admin app layout)
 *   - student active         → allow (render <Outlet /> for dashboard etc.)
 *   - student pending        → /waiting-for-approval (shows "waiting for approval")
 *   - student approved       → /waiting-for-approval (approval confirmed, code shown there, user activates from that page)
 *   - student rejected       → /waiting-for-approval (rejection message shown)
 *   - student suspended      → /waiting-for-approval (suspension message shown)
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, isStaff, loading, isActivated, activationStatus, profile } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // ── CRITICAL: never redirect while Firebase is still deciding the auth
    //    state OR the profile fetch is still in flight.
    if (loading) return;

    // 1) Unauthenticated → login page.
    if (!user) {
      void navigate({ to: "/auth", replace: true });
      return;
    }

    // 2) Staff (admin / instructor) have their own sub-layout and shouldn't
    //    hang out in the student routes.
    if (isStaff) {
      void navigate({ to: "/admin", replace: true });
      return;
    }

    // 3) Allow the "waiting" and "activate" pages to render unconditionally so
    //    we never create a redirect loop.
    const allowedPaths = ["/activate", "/waiting-for-approval"];
    if (allowedPaths.includes(pathname)) return;

    // 4) "Active" or profile-level suspended account safety:
    //    isActivated = staff OR activationStatus === "active"
    //    (Staff already handled above, so here isActivated means
    //     activationStatus === "active").
    //
    //    Additionally, when account.status === "suspended" the student also
    //    needs to go to the waiting page (suspension notice shown there).
    const accountSuspended = profile?.status === "suspended";

    if (!isActivated || accountSuspended || activationStatus === "suspended") {
      void navigate({ to: "/waiting-for-approval", replace: true });
      return;
    }
    // otherwise: student is fully activated → allow the page
  }, [user, isStaff, loading, isActivated, activationStatus, pathname, navigate, profile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative grid size-14 place-items-center rounded-2xl bg-primary/10 shadow-glow">
            <img src="/favicon.ico" alt="Loading" className="size-8 object-contain animate-pulse" />
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[slide_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  // While transitioning, render a blank screen so no protected content flashes
  // (the useEffect above will resolve the navigation very quickly).
  if (!user || isStaff) return null;

  return <Outlet />;
}
