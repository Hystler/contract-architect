import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUserSession } from "@/lib/auth/currentUser";

export default function LoginPage() {
  const user = getCurrentUserSession();

  if (user) {
    redirect("/generator");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <LoginForm />
    </main>
  );
}
