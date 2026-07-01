import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/admin0724")({
  head: () => ({
    meta: [{ title: "Admin — Casa Studio" }],
  }),
  component: Admin0724Page,
});

function Admin0724Page() {
  const navigate = useNavigate();

  return <AdminPanel onClose={() => navigate({ to: "/" })} />;
}
