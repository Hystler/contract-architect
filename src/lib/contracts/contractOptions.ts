export const contractKindValues = [
  "services",
  "contractor",
  "consulting",
  "it",
  "marketing",
  "design",
  "custom"
] as const;

export type ContractKind = (typeof contractKindValues)[number];

export const contractKindOptions: {
  value: ContractKind;
  label: string;
  subject: string;
  worksDescription: string;
  firstWork: string;
}[] = [
  {
    value: "services",
    label: "Оказание услуг",
    subject: "оказание услуг",
    worksDescription:
      "Исполнитель оказывает услуги, описанные в перечне работ, и передает результат Заказчику.",
    firstWork: "Оказание согласованных услуг"
  },
  {
    value: "contractor",
    label: "Выполнение работ",
    subject: "выполнение работ",
    worksDescription:
      "Исполнитель выполняет работы по заданию Заказчика и передает результат по акту.",
    firstWork: "Выполнение согласованных работ"
  },
  {
    value: "consulting",
    label: "Консультационные услуги",
    subject: "оказание консультационных услуг",
    worksDescription:
      "Исполнитель анализирует информацию, готовит рекомендации и передает материалы Заказчику.",
    firstWork: "Подготовка консультационных материалов"
  },
  {
    value: "it",
    label: "IT-услуги",
    subject: "оказание IT-услуг",
    worksDescription:
      "Исполнитель выполняет технические работы, настройку или сопровождение цифрового продукта.",
    firstWork: "Настройка и сопровождение цифрового продукта"
  },
  {
    value: "marketing",
    label: "Маркетинговые услуги",
    subject: "оказание маркетинговых услуг",
    worksDescription:
      "Исполнитель готовит маркетинговые материалы, проводит работы по продвижению или аналитике.",
    firstWork: "Подготовка маркетинговых материалов"
  },
  {
    value: "design",
    label: "Дизайн и креатив",
    subject: "оказание услуг по дизайну",
    worksDescription:
      "Исполнитель разрабатывает дизайн-материалы и передает Заказчику согласованные результаты.",
    firstWork: "Разработка дизайн-материалов"
  },
  {
    value: "custom",
    label: "Свой предмет",
    subject: "",
    worksDescription: "",
    firstWork: ""
  }
];

export function getContractKindOption(value: string | undefined) {
  return (
    contractKindOptions.find((option) => option.value === value) ||
    contractKindOptions[0]
  );
}
