/**
 * Admin section layout — wraps all /admin/* routes.
 * This file MUST only render <Outlet /> so child routes display properly.
 * The overview dashboard lives in _admin.admin.index.tsx
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin")({
  component: AdminSection,
});

function AdminSection() {
  return <Outlet />;
}
