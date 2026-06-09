import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const templatesDirectory = path.join(process.cwd(), "src", "templates");

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const relationships = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const contractParagraphs = [
  "Договор № {{contract_number}}",
  "г. {{city}} {{contract_date}}",
  "{{customer_type}} {{customer_name}}, именуемый в дальнейшем Заказчик, в лице {{customer_representative}}, действующего на основании {{customer_basis}}, с одной стороны, и {{contractor_type}} {{contractor_name}}, именуемый в дальнейшем Исполнитель, в лице {{contractor_representative}}, действующего на основании {{contractor_basis}}, с другой стороны, заключили настоящий договор.",
  "Предмет договора: {{subject}}.",
  "Описание работ: {{works_description}}",
  "Перечень работ:",
  "{{#works}}",
  "• {{name}}",
  "{{/works}}",
  "Общая сумма: {{total_amount}} руб. ({{total_amount_words}}).",
  "Предоплата: {{prepayment_percent}}, {{prepayment_amount}} руб. ({{prepayment_amount_words}}).",
  "Остаток оплаты: {{final_payment_amount}} руб. ({{final_payment_amount_words}}).",
  "Сроки выполнения работ: с {{start_date}} по {{end_date}}.",
  "Реквизиты заказчика: {{customer_requisites}}",
  "Реквизиты исполнителя: {{contractor_requisites}}"
];

const actParagraphs = [
  "Акт выполненных работ № {{act_number}}",
  "к договору № {{contract_number}} от {{contract_date}}",
  "Дата акта: {{act_date}}",
  "{{customer_name}} и {{contractor_name}} составили настоящий акт о том, что Исполнитель выполнил работы по предмету: {{subject}}.",
  "Описание работ: {{works_description}}",
  "Стоимость выполненных работ: {{total_amount}} руб. ({{total_amount_words}}).",
  "Реквизиты заказчика: {{customer_requisites}}",
  "Реквизиты исполнителя: {{contractor_requisites}}"
];

await mkdir(templatesDirectory, { recursive: true });
await createDocx(
  path.join(templatesDirectory, "contract-template.docx"),
  contractParagraphs
);
await createDocx(path.join(templatesDirectory, "act-template.docx"), actParagraphs);

async function createDocx(filePath, paragraphs) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels").file(".rels", relationships);
  zip.folder("word").file("document.xml", createDocumentXml(paragraphs));

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE"
  });

  await writeFile(filePath, buffer);
}

function createDocumentXml(paragraphs) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.map((paragraph) => createParagraph(paragraph)).join("\n")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function createParagraph(text) {
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
