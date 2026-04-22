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
  costPerUnit: number;
};

type RecipeItemForm = {
  rawMaterialId: string;
  quantity: string;
  notes: string;
};

export default function NewRecipePage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [items, setItems] = useState<RecipeItemForm[]>([
    { rawMaterialId: "", quantity: "", notes: "" },
  ]);
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
          throw new Error(productsJson.message || "No se pudieron cargar los productos.");
        }

        if (!rawMaterialsRes.ok) {
          throw new Error(rawMaterialsJson.message || "No se pudieron cargar los insumos.");
        }

        setProducts(productsJson.data ?? []);
        setRawMaterials(rawMaterialsJson.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando datos.");
      }
    }

    loadData();
  }, []);

  function updateItem(index: number, field: keyof RecipeItemForm, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { rawMaterialId: "", quantity: "", notes: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          name,
          description: description || undefined,
          productId,
          items: items.map((item) => ({
            rawMaterialId: item.rawMaterialId,
            quantity: Number(item.quantity),
            notes: item.notes || undefined,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear la receta.");
      }

      router.push("/recipes");
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
          <p style={eyebrowStyle}>Alta de receta</p>
          <h1 style={titleStyle}>Nueva receta</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <Field label="Código" value={code} onChange={setCode} required />
            <Field label="Nombre" value={name} onChange={setName} required />
            <Field
              label="Descripción"
              value={description}
              onChange={setDescription}
            />

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
          </div>

          <div style={itemsSectionStyle}>
            <div style={itemsHeaderStyle}>
              <h2 style={itemsTitleStyle}>Ítems de receta</h2>
              <button type="button" onClick={addItem} style={secondaryButtonStyle}>
                Agregar ítem
              </button>
            </div>

            <div style={itemsContainerStyle}>
              {items.map((item, index) => (
                <div key={index} style={itemCardStyle}>
                  <div style={gridStyle}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Insumo *</label>
                      <select
                        value={item.rawMaterialId}
                        onChange={(e) =>
                          updateItem(index, "rawMaterialId", e.target.value)
                        }
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

                    <Field
                      label="Cantidad *"
                      type="number"
                      value={item.quantity}
                      onChange={(value) => updateItem(index, "quantity", value)}
                      required
                    />

                    <Field
                      label="Notas"
                      value={item.notes}
                      onChange={(value) => updateItem(index, "notes", value)}
                    />
                  </div>

                  {items.length > 1 ? (
                    <div style={{ marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        style={dangerButtonStyle}
                      >
                        Quitar ítem
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={() => router.push("/recipes")}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Guardando..." : "Crear receta"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>
        {label} {required ? "*" : ""}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
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
  maxWidth: "1200px",
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

const itemsSectionStyle: React.CSSProperties = {
  marginTop: "24px",
};

const itemsHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const itemsTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
};

const itemsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const itemCardStyle: React.CSSProperties = {
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  background: "#f8fafc",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  marginTop: "24px",
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

const dangerButtonStyle: React.CSSProperties = {
  height: "36px",
  border: "1px solid #fecaca",
  borderRadius: "10px",
  padding: "0 12px",
  background: "#ffffff",
  color: "#b91c1c",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  color: "#b91c1c",
  marginTop: "16px",
  marginBottom: 0,
};