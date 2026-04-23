import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const entry = await prisma.financialEntry.findFirst({
      where: {
        id,
      },
    });

    if (!entry) {
      return NextResponse.json(
        {
          status: "error",
          message: "El movimiento financiero no existe.",
        },
        { status: 404 }
      );
    }

    if (entry.status !== "PENDING") {
      return NextResponse.json(
        {
          status: "error",
          message: "Solo se pueden pagar movimientos en estado PENDING.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.financialEntry.update({
      where: {
        id,
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
      include: {
        customer: true,
        supplier: true,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/financial-entries/[id]/pay error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo registrar el pago.",
      },
      { status: 500 }
    );
  }
}