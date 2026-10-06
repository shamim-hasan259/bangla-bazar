import { PrismaClient, Status, AdminUserType } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log("Connecting via Prisma Client...");
    // @ts-ignore
    const customers = await prisma.customer.findMany();
    console.log(`Found ${customers.length} records in Customer model.`);

    let migrated = 0;
    for (const cust of customers) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: cust.id },
            { phone: cust.phone || "unknown-phone-placeholder" }
          ]
        }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: cust.id,
            name: cust.name,
            phone: cust.phone || `017${Math.floor(10000000 + Math.random() * 90000000)}`,
            email: cust.email || undefined,
            photo: cust.photo || undefined,
            username: `cust_${cust.id.slice(-6)}_${Date.now()}`,
            type: AdminUserType.Admin, // placeholder enum before schema change
            password: cust.password,
            status: Status.Active,
          }
        });
        migrated++;
      }
    }

    console.log(`Successfully prepared ${migrated} customer records in User model.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
