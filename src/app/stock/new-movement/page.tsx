"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  productCode: string;
  name: string;
};

type RawMaterial = {
  id: string;
  code: string;
  name: string;
  unit: string;
};

type EntityType = "RAW_MATERIAL" | "PRODUCT";
type MovementType = "IN" | "OUT" | "ADJUSTMENT";

export default function NewStockMovementPage() {
  const router = useRouter();

  const [entityType, setEntityType] = useState<EntityType>("RAW_MATERIAL");
  const [movementType, setMovementType] = useState<MovementType>("IN");
  const [rawMaterialId, setRawMaterialId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, rawMaterialsRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/raw-materials", { cache: "no-store" }),
        ]);

        const productsJson = await productsRes.json();
        const rawMaterialsJson = await rawMaterialsRes.json();

        if (!productsRes.ok) {
          throw new Error(
            productsJson.message || "No se pudieron cargar los productos."
          );
        }

        if (!rawMaterialsRes.ok) {
          throw new Error(
            rawMaterialsJson.message || "No se pudieron cargar los insumos."
          );
        }

        setProducts(productsJson.data ?? []);
        setRawMaterials(rawMaterialsJson.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando datos.");
      }
    }

    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stock-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movementType,
          entityType,
          rawMaterialId:
            entityType === "RAW_MATERIAL" ? rawMaterialId : undefined,
          productId: entityType === "PRODUCT" ? productId : undefined,
          quantity: Number(quantity),
          unitCost: unitCost ? Number(unitCost) : undefined,
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el movimiento.");
      }

      router.push("/stock");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={eyebrowStyle}>Movimiento de stock</p>
          <h1 style={titleStyle}>Nuevo movimiento</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo de entidad *</label>
              <select
                value={entityType}
                onChange={(e) => {
                  const value = e.target.value as EntityType;
                  setEntityType(value);
                  setRawMaterialId("");
                  setProductId("");
                }}
                style={inputStyle}
              >
                <option value="RAW_MATERIAL">Insumo</option>
                <option value="PRODUCT">Producto</option>
              </select>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo de movimiento *</label>
              <select
                value={movementType}
                onChange={(e) =>
                  setMovementType(e.target.value as MovementType)
                }
                style={inputStyle}
              >
                <option value="IN">Entrada</option>
                <option value="OUT">Salida</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>

            {entityType === "RAW_MATERIAL" ? (
              <div style={fieldStyle}>
                <label style={labelStyle}>Insumo *</label>
                <select
                  value={rawMaterialId}
                  onChange={(e) => setRawMaterialId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar insumo</option>
                  {rawMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.code} - {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={fieldStyle}>
                <label style={labelStyle}>Producto *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productCode} - {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={fieldStyle}>
              <label style={labelStyle}>Cantidad *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Costo unitario</label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Notas</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={() => router.push("/stock")}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Guardando..." : "Crear movimiento"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "32px",
  fontFamily: "Arial, sans-serif",
  color: "#0f172a",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "24px",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#475569",
};

const titleStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  fontSize: "36px",
  lineHeight: 1.1,
};

const formStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "0 12px",
  fontSize: "14px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "20px",
};

const primaryButtonStyle: React.CSSProperties = {
  height: "42px",
  border: "none",
  borderRadius: "10px",
  padding: "0 16px",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  height: "42px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "0 16px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  color: "#b91c1c",
  marginTop: "16px",
  marginBottom: 0,
};