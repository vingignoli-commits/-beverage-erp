import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const salesOrderItemSchema = z.object({
  productId: z.string().min(1, "productId es obligatorio"),
  quantity: z.number().positive("quantity debe ser mayor a 0"),
  unitPrice: z.number().nonnegative("unitPrice debe ser >= 0"),
});

const createSalesOrderSchema = z.object({
  code: z.string().min(1, "code es obligatorio"),
  customerId: z.string().min(1, "customerId es obligatorio"),
  notes: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, "El pedido debe tener al menos un ítem"),
});

export async function GET() {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/sales-orders error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los pedidos de venta.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSalesOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Datos inválidos.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingOrder = await prisma.salesOrder.findFirst({
      where: {
        code: data.code,
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe un pedido de venta con ese código.",
        },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        deletedAt: null,
        status: {
          in: ["ACTIVE", "MOROSO"],
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          status: "error",
          message: "El cliente seleccionado no existe o no está habilitado.",
        },
        { status: 400 }
      );
    }

    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        deletedAt: null,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          status: "error",
          message: "Uno o más productos seleccionados no existen o no están activos.",
        },
        { status: 400 }
      );
    }

    const totalAmount = data.items.reduce((acc, item) => {
      return acc + item.quantity * item.unitPrice;
    }, 0);

    const order = await prisma.salesOrder.create({
      data: {
        code: data.code,
        customerId: data.customerId,
        notes: data.notes,
        totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/sales-orders error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el pedido de venta.",
      },
      { status: 500 }
    );
  }
}