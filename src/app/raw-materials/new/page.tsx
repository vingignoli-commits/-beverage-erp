"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Supplier = {
  id: string;
  supplierCode: string;
  legalName: string;
};

type FormState = {
  code: string;
  name: string;
  description: string;
  unit: string;
  costPerUnit: string;
  supplierId: string;
};

const initialState: FormState = {
  code: "",
  name: "",
  description: "",
  unit: "",
  costPerUnit: "",
  supplierId: "",
};

export default function NewRawMaterialPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialState);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    async function loadSuppliers() {
      try {
        setLoadingSuppliers(true);
        const response = await fetch("/api/suppliers", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "No se pudieron cargar los proveedores.");
        }

        setSuppliers(result.data ?? []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los proveedores."
        );
      } finally {
        setLoadingSuppliers(false);
      }
    }

    loadSuppliers();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingSubmit(true);
    setError("");

    try {
      const response = await fetch("/api/raw-materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          description: form.description || undefined,
          unit: form.unit,
          costPerUnit: Number(form.costPerUnit),
          supplierId: form.supplierId || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el insumo.");
      }

      router.push("/raw-materials");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <p style={eyebrowStyle}>Alta de insumo</p>
          <h1 style={titleStyle}>Nuevo insumo</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <Field
              label="Código"
              value={form.code}
              onChange={(value) => updateField("code", value)}
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
            <Field
              label="Unidad"
              value={form.unit}
              onChange={(value) => updateField("unit", value)}
              required
            />
            <Field
              label="Costo por unidad"
              type="number"
              value={form.costPerUnit}
              onChange={(value) => updateField("costPerUnit", value)}
              required
            />

            <div style={fieldStyle}>
              <label style={labelStyle}>Proveedor</label>
              <select
                value={form.supplierId}
                onChange={(e) => updateField("supplierId", e.target.value)}
                style={inputStyle}
                disabled={loadingSuppliers}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierCode} - {supplier.legalName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={() => router.push("/raw-materials")}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              style={primaryButtonStyle}
            >
              {loadingSubmit ? "Guardando..." : "Crear insumo"}
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