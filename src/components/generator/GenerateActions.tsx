"use client";

import { Button } from "@/components/ui/Button";

type GenerateActionsProps = {
  isGenerating: boolean;
  isSaving: boolean;
  onPreview: () => void;
  onSaveDraft: () => void;
};

export function GenerateActions({
  isGenerating,
  isSaving,
  onPreview,
  onSaveDraft
}: GenerateActionsProps) {
  return (
    <div className="rounded-lg border border-legal-border bg-paper-50 p-4 shadow-paper">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          disabled={isSaving || isGenerating}
          onClick={onSaveDraft}
          variant="secondary"
        >
          {isSaving ? "Сохранение..." : "Сохранить черновик"}
        </Button>
        <Button
          disabled={isGenerating || isSaving}
          onClick={onPreview}
          variant="secondary"
        >
          Открыть PDF-preview
        </Button>
        <Button disabled={isGenerating || isSaving} type="submit">
          {isGenerating ? "Формирование..." : "Скачать ZIP"}
        </Button>
      </div>
    </div>
  );
}
