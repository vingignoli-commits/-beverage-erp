import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function RawMaterialsPage() {
  const materials = await prisma.rawMaterial.findMany({
    where: { deletedAt: null },
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>Insumos</h1>

      <Link href="/raw-materials/new">Nuevo insumo</Link>

      <ul>
        {materials.map((m) => (
          <li key={m.id}>
            {m.code} - {m.name} - {m.costPerUnit} ({m.unit})
          </li>
        ))}
      </ul>
    </main>
  );
}