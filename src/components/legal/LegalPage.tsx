import Link from "next/link";

type LegalSection = {
  title: string;
  items: string[];
};

type LegalPageProps = {
  title: string;
  lead: string;
  sections: LegalSection[];
};

export function LegalPage({ title, lead, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-ink-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold" href="/">
            Contract Architect
          </Link>
          <Link className="text-sm font-semibold text-gold-300 hover:text-gold-400" href="/generator">
            Создать документ
          </Link>
        </header>

        <article className="mt-8 rounded-lg border border-legal-border bg-paper-50 p-6 text-graphite-950 shadow-paper sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-500">
            Юридическая информация
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-500">
            {lead}
          </p>

          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-500">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>

        <LegalFooter />
      </div>
    </main>
  );
}

export function LegalFooter() {
  const links = [
    { href: "/privacy", label: "Персональные данные" },
    { href: "/terms", label: "Пользовательское соглашение" },
    { href: "/consent", label: "Согласие на обработку ПДн" },
    { href: "/cookies", label: "Cookies" }
  ];

  return (
    <footer className="mt-8 flex flex-col gap-3 border-t border-white/10 py-6 text-sm text-steel-300 sm:flex-row sm:items-center sm:justify-between">
      <p>Contract Architect</p>
      <nav className="flex flex-wrap gap-x-4 gap-y-2">
        {links.map((link) => (
          <Link className="hover:text-gold-300" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
