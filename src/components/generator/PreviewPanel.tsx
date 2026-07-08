"use client";

import type { ContractFormValues } from "@/types/contract";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/documents/formatMoney";
import { getContractKindOption } from "@/lib/contracts/contractOptions";
import type { TemplateSummary } from "@/lib/templates/templateCatalog";

type PreviewPanelProps = {
  selectedTemplate?: TemplateSummary | null;
  values: ContractFormValues;
};

export function PreviewPanel({ selectedTemplate, values }: PreviewPanelProps) {
  const worksCount = values.works?.filter((work) => work.name?.trim()).length ?? 0;
  const contractKind = getContractKindOption(values.contractKind);

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-500">
        Резюме документа
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-graphite-950">
        Договор № {values.contractNumber || "не указан"}
      </h2>

      <div className="mt-5 space-y-4 text-sm">
        <SummaryRow
          label="Шаблон"
          value={selectedTemplate?.name || "Договор оказания услуг + акт"}
        />
        <SummaryRow label="Город" value={values.city || "не указан"} />
        <SummaryRow label="Тип договора" value={contractKind.label} />
        <SummaryRow
          label="Заказчик"
          value={values.customerName || "не указан"}
        />
        <SummaryRow
          label="Исполнитель"
          value={values.contractorName || "не указан"}
        />
        <SummaryRow label="Предмет" value={values.subject || "не указан"} />
        <SummaryRow label="Работы" value={`${worksCount} поз.`} />
        <SummaryRow
          label="Сумма"
          value={formatMoney(values.totalAmount || 0)}
        />
        <SummaryRow
          label="Предоплата"
          value={formatMoney(values.prepaymentAmount || 0)}
        />
        <SummaryRow
          label="Остаток"
          value={formatMoney(values.finalPaymentAmount || 0)}
        />
      </div>

      <div className="mt-6 rounded-md border border-legal-border bg-surface-100 p-4 text-sm leading-6 text-muted-500">
        DOCX-файлы формируются из шаблонов. PDF для MVP создается через печать
        HTML-preview в браузере.
      </div>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-legal-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-graphite-950">
        {value}
      </dd>
    </div>
  );
}
