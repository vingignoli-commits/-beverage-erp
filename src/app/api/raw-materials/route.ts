import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string(),
  costPerUnit: z.number(),
  supplierId: z.string().optional(),
});

export async function GET() {
  const materials = await prisma.rawMaterial.findMany({
    where: { deletedAt: null },
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ status: "ok", data: materials });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  const exists = await prisma.rawMaterial.findFirst({
    where: { code: parsed.data.code },
  });

  if (exists) {
    return NextResponse.json(
      { status: "error", message: "Código duplicado" },
      { status: 409 }
    );
  }

  const material = await prisma.rawMaterial.create({
    data: parsed.data,
  });

  return NextResponse.json({ status: "ok", data: material });
}