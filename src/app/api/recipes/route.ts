import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const recipeItemSchema = z.object({
  rawMaterialId: z.string().min(1, "rawMaterialId es obligatorio"),
  quantity: z.number().positive("quantity debe ser > 0"),
  notes: z.string().optional(),
});

const createRecipeSchema = z.object({
  code: z.string().min(1, "code es obligatorio"),
  name: z.string().min(1, "name es obligatorio"),
  description: z.string().optional(),
  productId: z.string().min(1, "productId es obligatorio"),
  items: z.array(recipeItemSchema).min(1, "La receta debe tener al menos un ítem"),
});

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        product: true,
        items: {
          include: {
            rawMaterial: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = recipes.map((recipe) => {
      const theoreticalCost = recipe.items.reduce((acc, item) => {
        return acc + item.quantity * item.rawMaterial.costPerUnit;
      }, 0);

      return {
        ...recipe,
        theoreticalCost,
      };
    });

    return NextResponse.json(
      {
        status: "ok",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/recipes error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener las recetas.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRecipeSchema.safeParse(body);

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

    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        code: data.code,
      },
    });

    if (existingRecipe) {
      return NextResponse.json(
        {
          status: "error",
          message: "Ya existe una receta con ese código.",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
        deletedAt: null,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          status: "error",
          message: "El producto seleccionado no existe.",
        },
        { status: 400 }
      );
    }

    const rawMaterialIds = data.items.map((item) => item.rawMaterialId);

    const rawMaterials = await prisma.rawMaterial.findMany({
      where: {
        id: {
          in: rawMaterialIds,
        },
        deletedAt: null,
      },
    });

    if (rawMaterials.length !== rawMaterialIds.length) {
      return NextResponse.json(
        {
          status: "error",
          message: "Uno o más insumos seleccionados no existen.",
        },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        productId: data.productId,
        items: {
          create: data.items.map((item) => ({
            rawMaterialId: item.rawMaterialId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        product: true,
        items: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    const theoreticalCost = recipe.items.reduce((acc, item) => {
      return acc + item.quantity * item.rawMaterial.costPerUnit;
    }, 0);

    return NextResponse.json(
      {
        status: "ok",
        data: {
          ...recipe,
          theoreticalCost,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/recipes error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "No se pudo crear la receta.",
      },
      { status: 500 }
    );
  }
}