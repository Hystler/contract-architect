"use client";

import { Button } from "@/components/ui/Button";

type GenerateActionsProps = {
  hasPersonalDataConsent: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  onPreview: () => void;
  onSaveDraft: () => void;
};

export function GenerateActions({
  hasPersonalDataConsent,
  isGenerating,
  isSaving,
  onPreview,
  onSaveDraft
}: GenerateActionsProps) {
  const isDisabled = isSaving || isGenerating || !hasPersonalDataConsent;

  return (
    <div className="rounded-lg border border-legal-border bg-paper-50 p-4 shadow-paper">
      {!hasPersonalDataConsent ? (
        <p className="mb-3 text-sm leading-6 text-muted-500">
          Отметьте согласие на обработку персональных данных, чтобы сформировать
          ZIP, открыть preview или сохранить черновик.
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          disabled={isDisabled}
          onClick={onSaveDraft}
          variant="secondary"
        >
          {isSaving ? "Сохранение..." : "Сохранить черновик"}
        </Button>
        <Button
          disabled={isDisabled}
          onClick={onPreview}
          variant="secondary"
        >
          Открыть PDF-preview
        </Button>
        <Button disabled={isDisabled} type="submit">
          {isGenerating ? "Формирование..." : "Скачать ZIP"}
        </Button>
      </div>
    </div>
  );
}
