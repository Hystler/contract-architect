import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const contractVariables = [
  "contract_number",
  "contract_date",
  "city",
  "customer_name",
  "customer_type",
  "customer_representative",
  "customer_basis",
  "customer_requisites",
  "contractor_name",
  "contractor_type",
  "contractor_representative",
  "contractor_basis",
  "contractor_requisites",
  "subject",
  "works_description",
  "works",
  "total_amount",
  "total_amount_words",
  "prepayment_percent",
  "prepayment_amount",
  "prepayment_amount_words",
  "final_payment_amount",
  "final_payment_amount_words",
  "start_date",
  "end_date"
];

const actVariables = [
  "act_number",
  "act_date",
  "contract_number",
  "contract_date",
  "customer_name",
  "contractor_name",
  "subject",
  "works_description",
  "total_amount",
  "total_amount_words",
  "customer_requisites",
  "contractor_requisites"
];

async function main() {
  await prisma.documentTemplate.createMany({
    data: [
      {
        type: "CONTRACT",
        name: "Договор оказания услуг",
        filePath: "src/templates/contract-template.docx",
        variables: contractVariables,
        isActive: true
      },
      {
        type: "ACT",
        name: "Акт выполненных работ",
        filePath: "src/templates/act-template.docx",
        variables: actVariables,
        isActive: true
      }
    ],
    skipDuplicates: true
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
