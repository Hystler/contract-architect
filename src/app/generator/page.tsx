import { ContractForm } from "@/components/generator/ContractForm";

export default function GeneratorPage() {
  return (
    <main className="min-h-screen bg-matte-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brass-300">
            Генерация пакета
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Данные для договора и акта
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-steel-300">
            Заполните одну форму. Система проверит данные, сформирует DOCX-файлы
            по шаблонам и соберет ZIP-архив.
          </p>
        </div>
        <ContractForm />
      </div>
    </main>
  );
}
