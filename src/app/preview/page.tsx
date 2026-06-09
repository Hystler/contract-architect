import { DocumentPreview } from "@/components/preview/DocumentPreview";
import { PrintActions } from "@/components/preview/PrintActions";

export default function PreviewPage() {
  return (
    <main className="print-shell min-h-screen bg-matte-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="no-print mx-auto mb-6 flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass-300">
            PDF-preview
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Печатная версия документов
          </h1>
        </div>
        <PrintActions />
      </div>
      <DocumentPreview />
    </main>
  );
}
