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
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, isStaff, loading, isActivated, activationStatus } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    if (isStaff) {
      void navigate({ to: "/admin" });
      return;
    }

    // Students with approved status need to go through the activate flow
    // (they can see their code on the waiting page and submit it there or at /activate).
    // Allow /activate and /waiting-for-approval to render without redirect to avoid loops.
    const allowedPaths = ["/activate", "/waiting-for-approval"];
    if (!isActivated && !allowedPaths.includes(pathname)) {
      // pending / approved → show waiting page (code revealed when approved)
      // rejected / suspended → also show waiting page with appropriate message
      void navigate({ to: "/waiting-for-approval" });
    }
  }, [user, isStaff, loading, isActivated, activationStatus, pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || isStaff) return null;

  return <Outlet />;
}
