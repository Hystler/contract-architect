import { readFile } from "node:fs/promises";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import JSZip from "jszip";
import PizZip from "pizzip";
import type { ContractFormValues } from "@/types/contract";
import {
  DocumentGenerationError,
  TemplateNotFoundError
} from "./documentErrors";
import { mapContractToTemplateData } from "./templateDataMapper";
import { sanitizeFileName } from "./sanitizeFileName";

const templatesDirectory = path.resolve(process.cwd(), "src", "templates");

export async function generateDocumentsZip(data: ContractFormValues) {
  const templateData = mapContractToTemplateData(data);

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

async function renderDocxTemplate(
  templateFileName: "contract-template.docx" | "act-template.docx",
  data: Record<string, unknown>
) {
  const templatePath = path.join(templatesDirectory, templateFileName);
  const content = await readTemplateFile(templatePath);

  try {
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      delimiters: {
        start: "{{",
        end: "}}"
      },
      paragraphLoop: true,
      linebreaks: true
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
