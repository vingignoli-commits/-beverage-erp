"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewRawMaterialPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    name: "",
    unit: "",
    costPerUnit: "",
    supplierId: "",
  });

  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((data) => setSuppliers(data.data || []));
  }, []);

  async function submit(e: any) {
    e.preventDefault();

    await fetch("/api/raw-materials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        costPerUnit: Number(form.costPerUnit),
        supplierId: form.supplierId || undefined,
      }),
    });

    router.push("/raw-materials");
  }

  return (
    <form onSubmit={submit}>
      <input
        placeholder="Código"
        onChange={(e) => setForm({ ...form, code: e.target.value })}
      />

      <input
        placeholder="Nombre"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Unidad (kg, l, unidad)"
        onChange={(e) => setForm({ ...form, unit: e.target.value })}
      />

      <input
        placeholder="Costo por unidad"
        type="number"
        onChange={(e) =>
          setForm({ ...form, costPerUnit: e.target.value })
        }
      />

      <select
        onChange={(e) =>
          setForm({ ...form, supplierId: e.target.value })
        }
      >
        <option value="">Sin proveedor</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button type="submit">Crear</button>
    </form>
  );
}