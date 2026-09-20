/**
 * Layout route that redirects unauthenticated users to /auth.
 * All protected pages nest under this route.
 * Staff users (owner/admin/instructor) are redirected to the admin panel.
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, isStaff, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth" });
    } else if (isStaff) {
      void navigate({ to: "/admin" });
    }
  }, [user, isStaff, loading, navigate]);

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
