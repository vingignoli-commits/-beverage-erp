import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const adminPassword = "Admin12345!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminRole = await prisma.role.upsert({
    where: {
      code: "ADMIN",
    },
    update: {
      name: "Administrador",
      description: "Acceso total al sistema",
    },
    create: {
      code: "ADMIN",
      name: "Administrador",
      description: "Acceso total al sistema",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: {
      email: "admin@beverage-erp.local",
    },
    update: {
      fullName: "Administrador",
      username: "admin",
      passwordHash,
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      fullName: "Administrador",
      email: "admin@beverage-erp.local",
      username: "admin",
      passwordHash,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  const checkUser = await prisma.user.findFirst({
    where: {
      email: "admin@beverage-erp.local",
    },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log("Seed completado correctamente.");
  console.log("Usuario:", checkUser?.username);
  console.log("Email:", checkUser?.email);
  console.log("Estado:", checkUser?.status);
  console.log(
    "Roles:",
    checkUser?.userRoles.map((userRole) => userRole.role.code).join(", ")
  );
  console.log("Contraseña:", adminPassword);
}

main()
  .catch((error) => {
    console.error("Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });