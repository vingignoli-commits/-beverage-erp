import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [users, customers, suppliers] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
    ]);

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        counts: {
          users,
          customers,
          suppliers,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: "No se pudo consultar la base de datos.",
      },
      { status: 500 }
    );
  }
}
