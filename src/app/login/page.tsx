"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") || "/customers";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setError("No hubo respuesta del servidor de autenticación.");
        setLoading(false);
        return;
      }

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.ok) {
        router.replace(result.url ?? callbackUrl);
        router.refresh();
        return;
      }

      setError("No se pudo iniciar sesión.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setLoading(false);
    }
  }

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <p style={eyebrowStyle}>Acceso al sistema</p>
        <h1 style={titleStyle}>Iniciar sesión</h1>
        <p style={descriptionStyle}>
          Usa el usuario administrador generado por seed para entrar al panel.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Usuario o email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={hintBoxStyle}>
          <strong>Acceso inicial:</strong>
          <p style={hintTextStyle}>
            Luego de correr el seed, el usuario por defecto será:
          </p>
          <ul style={listStyle}>
            <li>
              usuario: <code>admin</code>
            </li>
            <li>
              email: <code>admin@beverage-erp.local</code>
            </li>
            <li>
              contraseña: <code>Admin12345!</code>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "#f8fafc",
  fontFamily: "Arial, sans-serif",
  color: "#0f172a",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "460px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "28px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
};

const titleStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: "8px",
  fontSize: "34px",
  lineHeight: 1.1,
};

const descriptionStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "20px",
  color: "#475569",
  lineHeight: 1.6,
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
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

const buttonStyle: React.CSSProperties = {
  height: "44px",
  border: "none",
  borderRadius: "10px",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: "4px",
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "14px",
};

const hintBoxStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "16px",
  borderRadius: "12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const hintTextStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: "8px",
  color: "#475569",
};

const listStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  paddingLeft: "20px",
  color: "#475569",
};
