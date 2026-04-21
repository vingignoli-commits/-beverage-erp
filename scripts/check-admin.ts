import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: "admin" },
        { email: "admin@beverage-erp.local" },
      ],
    },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    console.log("No existe el usuario admin.");
    return;
  }

  console.log("Usuario encontrado:");
  console.log({
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    deletedAt: user.deletedAt,
    roles: user.userRoles.map((userRole) => userRole.role.code),
  });
}

main()
  .catch((error) => {
    console.error("Error verificando admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });