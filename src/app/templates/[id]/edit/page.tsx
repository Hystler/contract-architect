import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TemplateEditForm } from "@/components/templates/TemplateEditForm";
import { Button } from "@/components/ui/Button";
import { getCurrentUserSession } from "@/lib/auth/currentUser";
import { runPrisma } from "@/lib/prisma";
import { normalizeTemplateVariables } from "@/lib/templates/templateCatalog";

export const dynamic = "force-dynamic";

export default async function TemplateEditPage({
  params
}: {
  params: { id: string };
}) {
  const user = getCurrentUserSession();

  if (!user) {
    redirect("/login");
  }

  let template: Awaited<ReturnType<typeof loadTemplate>> = null;

  try {
    template = await loadTemplate(params.id, user.userId);
  } catch {
    template = null;
  }

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SiteHeader
          ctaHref="/templates"
          ctaLabel="Каталог"
          subtitle="Настройки пользовательского шаблона"
        />

        <section className="py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
            Редактор шаблона
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Настройки генератора
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-steel-300">
            Это редактор структуры формы, а не визуальный редактор DOCX.
            Юридический текст шаблона редактируется отдельно в Word.
          </p>
        </section>

        {template ? (
          <TemplateEditForm
            template={{
              ...template,
              variables: normalizeTemplateVariables(template.variables)
            }}
          />
        ) : (
          <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white shadow-soft">
            <h2 className="text-2xl font-semibold">Шаблон не найден</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-300">
              Возможно, шаблон не существует или принадлежит другому
              пользователю.
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href="/templates">Вернуться в каталог</Link>
            </Button>
          </section>
        )}
      </div>
    </main>
  );
}

async function loadTemplate(id: string, userId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  return runPrisma((client) =>
    client.documentTemplate.findFirst({
      where: {
        id,
        isUserUploaded: true,
        ownerUserId: userId
      },
      select: {
        id: true,
        category: true,
        description: true,
        isActive: true,
        isPremium: true,
        name: true,
        variables: true
      }
    })
  );
}
