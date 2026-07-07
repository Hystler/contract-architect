import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getCurrentAdminSession } from "@/lib/auth/currentUser";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const admin = getCurrentAdminSession();

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {admin ? <AdminDashboard /> : <AdminLoginForm />}
      </div>
    </main>
  );
}
