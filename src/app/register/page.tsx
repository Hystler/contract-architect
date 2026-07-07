import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getCurrentUserSession } from "@/lib/auth/currentUser";

export default function RegisterPage() {
  const user = getCurrentUserSession();

  if (user) {
    redirect("/account");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <RegisterForm />
    </main>
  );
}
