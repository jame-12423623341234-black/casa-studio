import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Casa Studio" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();

  return <AdminPanel onClose={() => navigate({ to: "/" })} />;
}
