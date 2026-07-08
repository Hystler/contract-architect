import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentUserSession } from "@/lib/auth/currentUser";

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
  subtitle?: string;
};

export function SiteHeader({
  ctaHref = "/generator",
  ctaLabel = "Создать договор",
  subtitle
}: SiteHeaderProps) {
  const user = getCurrentUserSession();

  return (
    <header className="mx-auto flex max-w-7xl flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link className="text-sm font-semibold text-white" href="/">
          Contract Architect
        </Link>
        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-steel-300">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button asChild size="md" variant="ghost">
          <Link href="/templates">Шаблоны</Link>
        </Button>
        {user ? (
          <>
            <span className="max-w-[220px] truncate text-sm text-steel-300">
              {user.email}
            </span>
            <Button asChild size="md" variant="ghost">
              <Link href="/account">Аккаунт</Link>
            </Button>
          </>
        ) : (
          <Button asChild size="md" variant="ghost">
            <Link href="/login">Войти</Link>
          </Button>
        )}
        <Button asChild size="md" variant="secondary">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </header>
  );
}
