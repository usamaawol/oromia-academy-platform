/**
 * Admin root — redirects /admin to /admin/exams.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin — Oromia Academy" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/admin/exams", replace: true });
  }, [navigate]);
  return null;
}
