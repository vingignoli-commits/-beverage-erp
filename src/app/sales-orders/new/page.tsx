"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  customerCode: string;
  legalName: string;
};

type Product = {
  id: string;
  productCode: string;
  name: string;
};

type OrderItemForm = {
  productId: string;
  quantity: string;
  unitPrice: string;
};

export default function NewSalesOrderPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItemForm[]>([
    { productId: "", quantity: "", unitPrice: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch("/api/customers", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);

        const customersJson = await customersRes.json();
        const productsJson = await productsRes.json();

        if (!customersRes.ok) {
          throw new Error(customersJson.message || "No se pudieron cargar los clientes.");
        }

        if (!productsRes.ok) {
          throw new Error(productsJson.message || "No se pudieron cargar los productos.");
        }

        setCustomers(customersJson.data ?? []);
        setProducts(productsJson.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando datos.");
      }
    }

    loadData();
  }, []);

  function updateItem(index: number, field: keyof OrderItemForm, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", quantity: "", unitPrice: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sales-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          customerId,
          notes: notes || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el pedido.");
      }

      router.push("/sales-orders");
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
          <p style={eyebrowStyle}>Pedido de venta</p>
          <h1 style={titleStyle}>Nuevo pedido</h1>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            <Field label="Código" value={code} onChange={setCode} required />

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

            <Field label="Notas" value={notes} onChange={setNotes} />
          </div>

          <div style={itemsSectionStyle}>
            <div style={itemsHeaderStyle}>
              <h2 style={itemsTitleStyle}>Ítems del pedido</h2>
              <button type="button" onClick={addItem} style={secondaryButtonStyle}>
                Agregar ítem
              </button>
            </div>

            <div style={itemsContainerStyle}>
              {items.map((item, index) => (
                <div key={index} style={itemCardStyle}>
                  <div style={gridStyle}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Producto *</label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, "productId", e.target.value)
                        }
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

                    <Field
                      label="Cantidad *"
                      type="number"
                      value={item.quantity}
                      onChange={(value) => updateItem(index, "quantity", value)}
                      required
                    />

                    <Field
                      label="Precio unitario *"
                      type="number"
                      value={item.unitPrice}
                      onChange={(value) => updateItem(index, "unitPrice", value)}
                      required
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
              onClick={() => router.push("/sales-orders")}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Guardando..." : "Crear pedido"}
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