import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCustomerSchema = z.object({
  customerCode: z.string().min(1, "customerCode es obligatorio"),
  legalName: z.string().min(1, "legalName es obligatorio"),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  taxCondition: z.string().optional(),
  email: z.string().email("email inválido").optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  creditLimit: z.number().nonnegative().optional(),
  paymentTermsDays: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: customers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/customers error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los clientes.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);

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

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { customerCode: data.customerCode },
          ...(data.taxId ? [{ taxId: data.taxId }] : []),
        ],
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe un cliente con ese código o CUIT/DNI.",
        },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        customerCode: data.customerCode,
        legalName: data.legalName,
        tradeName: data.tradeName,
        taxId: data.taxId,
        taxCondition: data.taxCondition,
        email: data.email,
        phone: data.phone,
        whatsappPhone: data.whatsappPhone,
        addressLine: data.addressLine,
        city: data.city,
        province: data.province,
        country: data.country ?? "Argentina",
        postalCode: data.postalCode,
        creditLimit:
          data.creditLimit !== undefined ? data.creditLimit.toString() : undefined,
        paymentTermsDays: data.paymentTermsDays ?? 0,
        notes: data.notes,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/customers error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear el cliente.",
      },
      { status: 500 }
    );
  }
}