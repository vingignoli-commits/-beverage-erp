import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateCustomerSchema = z.object({
  customerCode: z.string().min(1).optional(),
  legalName: z.string().min(1).optional(),
  tradeName: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  taxCondition: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsappPhone: z.string().nullable().optional(),
  addressLine: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  creditLimit: z.number().nonnegative().nullable().optional(),
  paymentTermsDays: z.number().int().nonnegative().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "MOROSO", "BLOCKED"]).optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Cliente no encontrado.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        data: customer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo obtener el cliente.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateCustomerSchema.safeParse(body);

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

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Cliente no encontrado.",
        },
        { status: 404 }
      );
    }

    const data = parsed.data;

    if (data.customerCode && data.customerCode !== existingCustomer.customerCode) {
      const duplicatedCode = await prisma.customer.findFirst({
        where: {
          customerCode: data.customerCode,
          id: {
            not: id,
          },
        },
      });

      if (duplicatedCode) {
        return NextResponse.json(
          {
            status: "error",
            message: "Ya existe otro cliente con ese código.",
          },
          { status: 409 }
        );
      }
    }

    if (data.taxId && data.taxId !== existingCustomer.taxId) {
      const duplicatedTaxId = await prisma.customer.findFirst({
        where: {
          taxId: data.taxId,
          id: {
            not: id,
          },
        },
      });

      if (duplicatedTaxId) {
        return NextResponse.json(
          {
            status: "error",
            message: "Ya existe otro cliente con ese CUIT/DNI.",
          },
          { status: 409 }
        );
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id,
      },
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
        country: data.country,
        postalCode: data.postalCode,
        creditLimit:
          data.creditLimit !== undefined
            ? data.creditLimit === null
              ? null
              : data.creditLimit.toString()
            : undefined,
        paymentTermsDays: data.paymentTermsDays,
        notes: data.notes,
        status: data.status,
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        data: updatedCustomer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/customers/[id] error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo actualizar el cliente.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          status: "error",
          message: "Cliente no encontrado.",
        },
        { status: 404 }
      );
    }

    await prisma.customer.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });

    return NextResponse.json(
      {
        status: "ok",
        message: "Cliente dado de baja lógicamente.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo dar de baja el cliente.",
      },
      { status: 500 }
    );
  }
}