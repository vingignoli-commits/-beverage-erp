"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  productCode: string;
  name: string;
  description: string;
  type: "FINISHED" | "INTERMEDIATE";
  unit: string;
  volumeMl: string;
  alcoholPercent: string;
};

const initialState: FormState = {
  productCode: "",
  name: "",
  description: "",
  type: "FINISHED",
  unit: "bottle",
  volumeMl: "",
  alcoholPercent: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productCode: form.productCode,
          name: form.name,
          description: form.description || undefined,
          type: form.type,
          unit: form.unit,
          volumeMl: form.volumeMl ? Number(form.volumeMl) : undefined,
          alcoholPercent: form.alcoholPercent
            ? Number(form.alcoholPercent)
            : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el producto.");
      }

      router.push("/products");
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
          <p style={eyebrowStyle}>Alta de producto</p>
          <h1 style={titleStyle}>Nuevo producto</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <Field
              label="Código"
              value={form.productCode}
              onChange={(value) => updateField("productCode", value)}
              required
            />
            <Field
              label="Nombre"
              value={form.name}
              onChange={(value) => updateField("name", value)}
              required
            />
            <Field
              label="Descripción"
              value={form.description}
              onChange={(value) => updateField("description", value)}
            />

            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo *</label>
              <select
                value={form.type}
                onChange={(e) =>
                  updateField(
                    "type",
                    e.target.value as "FINISHED" | "INTERMEDIATE"
                  )
                }
                style={inputStyle}
              >
                <option value="FINISHED">Final</option>
                <option value="INTERMEDIATE">Intermedio</option>
              </select>
            </div>

            <Field
              label="Unidad"
              value={form.unit}
              onChange={(value) => updateField("unit", value)}
              required
            />
            <Field
              label="Volumen (ml)"
              type="number"
              value={form.volumeMl}
              onChange={(value) => updateField("volumeMl", value)}
            />
            <Field
              label="Alcohol %"
              type="number"
              value={form.alcoholPercent}
              onChange={(value) => updateField("alcoholPercent", value)}
            />
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={() => router.push("/products")}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Guardando..." : "Crear producto"}
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