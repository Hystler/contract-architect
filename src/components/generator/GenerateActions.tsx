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
    <div className="rounded-md border border-white/10 bg-matte-900/85 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button disabled={isSaving || isGenerating} onClick={onSaveDraft} variant="secondary">
          {isSaving ? "Сохранение..." : "Сохранить черновик"}
        </Button>
        <Button disabled={isGenerating || isSaving} onClick={onPreview} variant="secondary">
          Открыть PDF-preview
        </Button>
        <Button disabled={isGenerating || isSaving} type="submit">
          {isGenerating ? "Формирование..." : "Скачать ZIP"}
        </Button>
      </div>
    </div>
  );
}
