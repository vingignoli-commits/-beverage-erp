"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  customerCode: string;
  legalName: string;
};

type Supplier = {
  id: string;
  supplierCode: string;
  legalName: string;
};

type EntryType = "INCOME" | "EXPENSE";

export default function NewFinancialEntryPage() {
  const router = useRouter();

  const [type, setType] = useState<EntryType>("INCOME");
  const [code, setCode] = useState("");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [customersRes, suppliersRes] = await Promise.all([
          fetch("/api/customers", { cache: "no-store" }),
          fetch("/api/suppliers", { cache: "no-store" }),
        ]);

        const customersJson = await customersRes.json();
        const suppliersJson = await suppliersRes.json();

        if (!customersRes.ok) {
          throw new Error(customersJson.message || "No se pudieron cargar los clientes.");
        }

        if (!suppliersRes.ok) {
          throw new Error(suppliersJson.message || "No se pudieron cargar los proveedores.");
        }

        setCustomers(customersJson.data ?? []);
        setSuppliers(suppliersJson.data ?? []);
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
      const response = await fetch("/api/financial-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          type,
          concept,
          amount: Number(amount),
          dueDate: dueDate || undefined,
          notes: notes || undefined,
          customerId: type === "INCOME" ? customerId : undefined,
          supplierId: type === "EXPENSE" ? supplierId : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el movimiento.");
      }

      router.push("/financial");
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
          <p style={eyebrowStyle}>Movimiento financiero</p>
          <h1 style={titleStyle}>Nuevo movimiento</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Tipo *</label>
              <select
                value={type}
                onChange={(e) => {
                  const nextType = e.target.value as EntryType;
                  setType(nextType);
                  setCustomerId("");
                  setSupplierId("");
                }}
                style={inputStyle}
              >
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Egreso</option>
              </select>
            </div>

            <Field label="Código" value={code} onChange={setCode} required />
            <Field label="Concepto" value={concept} onChange={setConcept} required />
            <Field label="Monto" type="number" value={amount} onChange={setAmount} required />
            <Field label="Vencimiento" type="date" value={dueDate} onChange={setDueDate} />

            {type === "INCOME" ? (
              <div style={fieldStyle}>
                <label style={labelStyle}>Cliente *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerCode} - {customer.legalName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={fieldStyle}>
                <label style={labelStyle}>Proveedor *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierCode} - {supplier.legalName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Field label="Notas" value={notes} onChange={setNotes} />
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <div style={actionsStyle}>
            <button
              type="button"
              onClick={() => router.push("/financial")}
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