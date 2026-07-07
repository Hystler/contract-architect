export class TemplateNotFoundError extends Error {
  constructor() {
    super("Шаблон документа не найден на сервере.");
    this.name = "TemplateNotFoundError";
  }
}

export class DocumentGenerationError extends Error {
  constructor() {
    super("Не удалось сформировать документы. Проверьте данные и шаблоны.");
    this.name = "DocumentGenerationError";
  }
}
