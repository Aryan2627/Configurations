const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.hnkdzevkfxsmqcpzryrp:Aryan%401T244242@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function main() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.log("No organization found");
    return;
  }
  const orgId = org.id;

  const fields = [
    {
      formName: 'Intake',
      fieldName: 'custom_category',
      fieldLabel: 'Category',
      fieldType: 'dropdown',
      options: JSON.stringify(['Hardware', 'Software', 'Services', 'Supplies'])
    },
    {
      formName: 'Intake',
      fieldName: 'custom_department',
      fieldLabel: 'Department',
      fieldType: 'dropdown',
      options: JSON.stringify(['IT', 'HR', 'Finance', 'Marketing', 'Operations'])
    },
    {
      formName: 'Product',
      fieldName: 'custom_category',
      fieldLabel: 'Category',
      fieldType: 'dropdown',
      options: JSON.stringify(['IT Equipment', 'Office Supplies', 'Software Licenses'])
    },
    {
      formName: 'Product',
      fieldName: 'custom_department',
      fieldLabel: 'Department',
      fieldType: 'dropdown',
      options: JSON.stringify(['IT', 'HR', 'Finance', 'Marketing', 'Operations'])
    }
  ];

  for (const field of fields) {
    await prisma.formConfiguration.upsert({
      where: {
        organizationId_formName_fieldName: {
          organizationId: orgId,
          formName: field.formName,
          fieldName: field.fieldName
        }
      },
      update: field,
      create: {
        organizationId: orgId,
        ...field
      }
    });
    console.log(`Seeded ${field.fieldLabel} for ${field.formName}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
