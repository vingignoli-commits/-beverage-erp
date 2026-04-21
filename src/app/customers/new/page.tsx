"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  customerCode: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  taxCondition: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  addressLine: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  creditLimit: string;
  paymentTermsDays: string;
  notes: string;
};

const initialState: FormState = {
  customerCode: "",
  legalName: "",
  tradeName: "",
  taxId: "",
  taxCondition: "",
  email: "",
  phone: "",
  whatsappPhone: "",
  addressLine: "",
  city: "",
  province: "",
  country: "Argentina",
  postalCode: "",
  creditLimit: "",
  paymentTermsDays: "0",
  notes: "",
};

export default function NewCustomerPage() {
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
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerCode: form.customerCode,
          legalName: form.legalName,
          tradeName: form.tradeName || undefined,
          taxId: form.taxId || undefined,
          taxCondition: form.taxCondition || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          whatsappPhone: form.whatsappPhone || undefined,
          addressLine: form.addressLine || undefined,
          city: form.city || undefined,
          province: form.province || undefined,
          country: form.country || undefined,
          postalCode: form.postalCode || undefined,
          creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined,
          paymentTermsDays: form.paymentTermsDays
            ? Number(form.paymentTermsDays)
            : 0,
          notes: form.notes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el cliente.");
      }

      router.push("/customers");
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
          <p style={eyebrowStyle}>Alta de cliente</p>
          <h1 style={titleStyle}>Nuevo cliente</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <Field
              label="Código"
              value={form.customerCode}
              onChange={(value) => updateField("customerCode", value)}
              required
            />
            <Field
              label="Razón social"
              value={form.legalName}
              onChange={(value) => updateField("legalName", value)}
              required
            />
            <Field
              label="Nombre comercial"
              value={form.tradeName}
              onChange={(value) => updateField("tradeName", value)}
            />
            <Field
              label="CUIT/DNI"
              value={form.taxId}
              onChange={(value) => updateField("taxId", value)}
            />
            <Field
              label="Condición fiscal"
              value={form.taxCondition}
              onChange={(value) => updateField("taxCondition", value)}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />
            <Field
              label="Teléfono"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
            />
            <Field
              label="WhatsApp"
              value={form.whatsappPhone}
              onChange={(value) => updateField("whatsappPhone", value)}
            />
            <Field
              label="Dirección"
              value={form.addressLine}
              onChange={(value) => updateField("addressLine", value)}
            />
            <Field
              label="Ciudad"
              value={form.city}
              onChange={(value) => updateField("city", value)}
            />
            <Field
              label="Provincia"
              value={form.province}
              onChange={(value) => updateField("province", value)}
            />
            <Field
              label="País"
              value={form.country}
              onChange={(value) => updateField("country", value)}
            />
            <Field
              label="Código postal"
              value={form.postalCode}
              onChange={(value) => updateField("postalCode", value)}
            />
            <Field
              label="Límite de crédito"
              type="number"
              value={form.creditLimit}
              onChange={(value) => updateField("creditLimit", value)}
            />
            <Field
              label="Días de pago"
              type="number"
              value={form.paymentTermsDays}
              onChange={(value) => updateField("paymentTermsDays", value)}
            />
          </div>

          <div style={textareaGroupStyle}>
            <label style={labelStyle}>Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              style={textareaStyle}
              rows={5}
            />
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <div style={actionsStyle}>
            <button type="button" onClick={() => router.push("/customers")} style={secondaryButtonStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Guardando..." : "Crear cliente"}
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

const textareaGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginTop: "16px",
};

const textareaStyle: React.CSSProperties = {
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "12px",
  fontSize: "14px",
  resize: "vertical",
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