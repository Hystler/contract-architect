"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  contractFormSchema,
  defaultContractValues
} from "@/lib/validation/contractSchema";
import { mapContractToTemplateData } from "@/lib/documents/templateDataMapper";
import type { ContractFormValues, TemplateData } from "@/types/contract";

const sampleData: ContractFormValues = {
  ...defaultContractValues,
  customerName: "ООО «Заказчик»",
  customerRepresentative: "Иванов Иван Иванович",
  customerBasis: "Устава",
  customerRequisites:
    "ИНН 7700000000, ОГРН 1107700000000, 123456, г. Москва, ул. Примерная, д. 1",
  contractorName: "ИП Петров Петр Петрович",
  contractorRepresentative: "Петров Петр Петрович",
  contractorBasis: "свидетельства о государственной регистрации",
  contractorRequisites:
    "ИНН 500000000000, ОГРНИП 300000000000000, р/с 40802810000000000000",
  subject: "оказание консультационных услуг",
  worksDescription:
    "Исполнитель оказывает услуги по подготовке материалов, анализу информации и передаче результата Заказчику.",
  works: [
    { name: "Сбор и анализ исходных данных" },
    { name: "Подготовка итогового отчета" }
  ],
  startDate: defaultContractValues.contractDate,
  endDate: defaultContractValues.actDate
};

export function DocumentPreview() {
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("contract-preview-data");

    if (saved) {
      const parsed = contractFormSchema.safeParse(JSON.parse(saved));
      if (parsed.success) {
        setTemplateData(mapContractToTemplateData(parsed.data));
        return;
      }
    }

    setIsFallback(true);
    setTemplateData(mapContractToTemplateData(sampleData));
  }, []);

  if (!templateData) {
    return (
      <Card className="mx-auto max-w-5xl p-6 text-steel-200">
        Подготовка печатной версии...
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {isFallback ? (
        <div className="no-print mb-5 rounded-md border border-brass-300/25 bg-brass-300/10 p-4 text-sm leading-6 text-brass-300">
          Данные формы не найдены. Показан пример печатной версии.
        </div>
      ) : null}

      <article className="print-document mx-auto min-h-[297mm] rounded-md border border-white/10 bg-[#fbfaf6] p-6 shadow-soft sm:p-10">
        <ContractHtml data={templateData} />
        <div className="print-page-break" />
        <ActHtml data={templateData} />
      </article>

      <div className="no-print mt-6 flex justify-center">
        <Button onClick={() => window.print()}>Скачать / распечатать PDF</Button>
      </div>
    </div>
  );
}

function ContractHtml({ data }: { data: TemplateData }) {
  return (
    <section>
      <h2 className="text-center text-2xl font-bold">
        Договор № {data.contract_number}
      </h2>
      <div className="mt-6 flex justify-between gap-8 text-base">
        <span>г. {data.city}</span>
        <span>{data.contract_date}</span>
      </div>

      <p className="mt-8 text-justify">
        {data.customer_type} {data.customer_name}, именуемый в дальнейшем
        «Заказчик», в лице {data.customer_representative}, действующего на
        основании {data.customer_basis}, с одной стороны, и {data.contractor_type}{" "}
        {data.contractor_name}, именуемый в дальнейшем «Исполнитель», в лице{" "}
        {data.contractor_representative}, действующего на основании{" "}
        {data.contractor_basis}, с другой стороны, заключили настоящий договор о
        нижеследующем.
      </p>

      <h3 className="mt-8 text-lg font-bold">1. Предмет договора</h3>
      <p className="mt-3 text-justify">
        Исполнитель обязуется выполнить работы: {data.subject}. Описание работ:{" "}
        {data.works_description}
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-7">
        {data.works.map((work) => (
          <li key={work.name}>{work.name}</li>
        ))}
      </ul>

      <h3 className="mt-8 text-lg font-bold">2. Стоимость и порядок оплаты</h3>
      <p className="mt-3 text-justify">
        Общая стоимость работ составляет {data.total_amount} руб. (
        {data.total_amount_words}). Предоплата составляет{" "}
        {data.prepayment_percent}, что равно {data.prepayment_amount} руб. (
        {data.prepayment_amount_words}). Остаток оплаты составляет{" "}
        {data.final_payment_amount} руб. ({data.final_payment_amount_words}).
      </p>

      <h3 className="mt-8 text-lg font-bold">3. Сроки выполнения работ</h3>
      <p className="mt-3 text-justify">
        Дата начала работ: {data.start_date}. Дата окончания работ:{" "}
        {data.end_date}.
      </p>

      <h3 className="mt-8 text-lg font-bold">4. Реквизиты сторон</h3>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <Requisites title="Заказчик" value={data.customer_requisites} />
        <Requisites title="Исполнитель" value={data.contractor_requisites} />
      </div>
    </section>
  );
}

function ActHtml({ data }: { data: TemplateData }) {
  return (
    <section className="pt-8">
      <h2 className="text-center text-2xl font-bold">
        Акт выполненных работ № {data.act_number}
      </h2>
      <p className="mt-3 text-center">
        к договору № {data.contract_number} от {data.contract_date}
      </p>
      <p className="mt-6 text-right">{data.act_date}</p>

      <p className="mt-8 text-justify">
        {data.customer_name}, именуемый в дальнейшем «Заказчик», и{" "}
        {data.contractor_name}, именуемый в дальнейшем «Исполнитель», составили
        настоящий акт о том, что Исполнитель выполнил работы по предмету:{" "}
        {data.subject}.
      </p>

      <p className="mt-5 text-justify">
        Описание выполненных работ: {data.works_description}
      </p>

      <p className="mt-5 text-justify">
        Стоимость выполненных работ составляет {data.total_amount} руб. (
        {data.total_amount_words}). Стороны подтверждают выполнение работ в
        указанном объеме.
      </p>

      <h3 className="mt-8 text-lg font-bold">Реквизиты сторон</h3>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <Requisites title="Заказчик" value={data.customer_requisites} />
        <Requisites title="Исполнитель" value={data.contractor_requisites} />
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <Signature title="Заказчик" />
        <Signature title="Исполнитель" />
      </div>
    </section>
  );
}

function Requisites({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <h4 className="font-bold">{title}</h4>
      <p className="mt-2 whitespace-pre-line break-words text-sm">{value}</p>
    </div>
  );
}

function Signature({ title }: { title: string }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <div className="mt-10 border-b border-black" />
      <p className="mt-2 text-sm">подпись</p>
    </div>
  );
}
