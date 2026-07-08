import { readFile } from "node:fs/promises";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import JSZip from "jszip";
import PizZip from "pizzip";
import type { DocumentTemplateType } from "@prisma/client";
import { defaultContractTemplateId } from "@/lib/templates/templateCatalog";
import type { ContractFormValues } from "@/types/contract";
import {
  DocumentGenerationError,
  TemplateNotFoundError
} from "./documentErrors";
import { mapContractToTemplateData } from "./templateDataMapper";
import { sanitizeFileName } from "./sanitizeFileName";

const templatesDirectory = path.resolve(process.cwd(), "src", "templates");
const projectRoot = path.resolve(process.cwd());

export type DocumentGenerationTemplate = {
  id: string;
  name: string;
  type: DocumentTemplateType;
  filePath?: string | null;
  contentBase64?: string | null;
};

export async function generateDocumentsZip(
  data: ContractFormValues,
  options: { template?: DocumentGenerationTemplate | null } = {}
) {
  const templateData = mapContractToTemplateData(data);
  const selectedTemplate = options.template;

  if (selectedTemplate && selectedTemplate.id !== defaultContractTemplateId) {
    const generatedBuffer = await renderSelectedTemplate(
      selectedTemplate,
      templateData
    );
    const documentNumber =
      selectedTemplate.type === "ACT" ? data.actNumber : data.contractNumber;
    const generatedFileName = `${sanitizeFileName(selectedTemplate.name)}-${sanitizeFileName(documentNumber)}.docx`;

    const zip = new JSZip();
    zip.file(generatedFileName, generatedBuffer);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return {
      zipBuffer,
      fileName: `documents-${sanitizeFileName(documentNumber)}.zip`
    };
  }

  const [contractBuffer, actBuffer] = await Promise.all([
    renderDocxTemplate("contract-template.docx", templateData),
    renderDocxTemplate("act-template.docx", templateData)
  ]);

  const contractFileName = `dogovor-${sanitizeFileName(data.contractNumber)}.docx`;
  const actFileName = `akt-${sanitizeFileName(data.actNumber)}.docx`;

  const zip = new JSZip();
  zip.file(contractFileName, contractBuffer);
  zip.file(actFileName, actBuffer);

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return {
    zipBuffer,
    fileName: `documents-${sanitizeFileName(data.contractNumber)}.zip`
  };
}

async function renderSelectedTemplate(
  template: DocumentGenerationTemplate,
  data: Record<string, unknown>
) {
  const content = await readSelectedTemplateContent(template);
  return renderDocxBuffer(content, data);
}

async function renderDocxTemplate(
  templateFileName: "contract-template.docx" | "act-template.docx",
  data: Record<string, unknown>
) {
  const templatePath = path.join(templatesDirectory, templateFileName);
  const content = await readTemplateFile(templatePath);
  return renderDocxBuffer(content, data);
}

function renderDocxBuffer(content: Buffer, data: Record<string, unknown>) {
  try {
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      delimiters: {
        start: "{{",
        end: "}}"
      },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => ""
    });

    doc.render(data);

    return doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE"
    });
  } catch (error) {
    if (error instanceof TemplateNotFoundError) {
      throw error;
    }

    throw new DocumentGenerationError();
  }
}

async function readSelectedTemplateContent(template: DocumentGenerationTemplate) {
  if (template.contentBase64) {
    return Buffer.from(template.contentBase64, "base64");
  }

  if (!template.filePath) {
    throw new TemplateNotFoundError();
  }

  const templatePath = path.resolve(projectRoot, template.filePath);

  if (!templatePath.startsWith(projectRoot)) {
    throw new TemplateNotFoundError();
  }

  return readTemplateFile(templatePath);
}

async function readTemplateFile(templatePath: string) {
  try {
    return await readFile(templatePath);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new TemplateNotFoundError();
    }

    throw new DocumentGenerationError();
  }
}

function isNotFoundError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
