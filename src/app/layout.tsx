import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

export const metadata: Metadata = {
  title: "Beverage ERP",
  description: "ERP para gestión de empresa productora de bebidas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body style={bodyStyle}>
        <div style={appShellStyle}>
          <aside style={sidebarStyle}>
            <div>
              <div style={brandBlockStyle}>
                <p style={brandEyebrowStyle}>Sistema operativo</p>
                <h1 style={brandTitleStyle}>Beverage ERP</h1>
              </div>

              <nav style={navStyle}>
                <Link href="/" style={navLinkStyle}>
                  Inicio
                </Link>
                <Link href="/customers" style={navLinkStyle}>
                  Clientes
                </Link>
                <Link href="/suppliers" style={navLinkStyle}>
                  Proveedores
                </Link>
                <Link href="/products" style={navLinkStyle}>
                  Productos
                </Link>
                <Link href="/raw-materials" style={navLinkStyle}>
                  Insumos
                </Link>
                <Link href="/recipes" style={navLinkStyle}>
                  Recetas
                </Link>
                <Link href="/stock" style={navLinkStyle}>
                  Stock
                </Link>
              </nav>
            </div>

            <div style={sidebarFooterStyle}>
              {session?.user ? (
                <div style={userBoxStyle}>
                  <p style={userEyebrowStyle}>Sesión activa</p>
                  <p style={userNameStyle}>
                    {session.user.name ||
                      session.user.username ||
                      session.user.email}
                  </p>
                  <p style={userMetaStyle}>{session.user.email || ""}</p>
                  <div style={{ marginTop: "12px" }}>
                    <LogoutButton />
                  </div>
                </div>
              ) : (
                <Link href="/login" style={loginLinkStyle}>
                  Ir a login
                </Link>
              )}
            </div>
          </aside>

          <div style={mainWrapperStyle}>
            <header style={topbarStyle}>
              <div>
                <p style={topbarEyebrowStyle}>Entorno actual</p>
                <h2 style={topbarTitleStyle}>Desarrollo</h2>
              </div>
            </header>

            <div style={contentStyle}>{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily: "Arial, sans-serif",
};

const appShellStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  minHeight: "100vh",
};

const sidebarStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRight: "1px solid #e2e8f0",
  background: "#ffffff",
  padding: "24px 18px",
};

const brandBlockStyle: React.CSSProperties = {
  marginBottom: "28px",
};

const brandEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
};

const brandTitleStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  fontSize: "28px",
  lineHeight: 1.1,
};

const navStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const navLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "12px 14px",
  borderRadius: "10px",
  textDecoration: "none",
  color: "#0f172a",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontWeight: 700,
};

const sidebarFooterStyle: React.CSSProperties = {
  paddingTop: "18px",
  borderTop: "1px solid #e2e8f0",
};

const userBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "14px",
};

const userEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
};

const userNameStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: "4px",
  fontSize: "15px",
  fontWeight: 700,
  color: "#0f172a",
};

const userMetaStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "#64748b",
  wordBreak: "break-word",
};

const loginLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "42px",
  padding: "0 16px",
  borderRadius: "10px",
  background: "#0f172a",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};

const mainWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

const topbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 24px",
  borderBottom: "1px solid #e2e8f0",
  background: "#ffffff",
};

const topbarEyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#64748b",
};

const topbarTitleStyle: React.CSSProperties = {
  marginTop: "6px",
  marginBottom: 0,
  fontSize: "22px",
};

const contentStyle: React.CSSProperties = {
  padding: "24px",
};