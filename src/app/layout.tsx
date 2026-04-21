import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beverage ERP",
  description: "ERP para gestión de empresa productora de bebidas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              </nav>
            </div>

            <div style={sidebarFooterStyle}>
              <p style={footerTextStyle}>
                Base inicial de operación.
              </p>
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

const footerTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "#64748b",
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