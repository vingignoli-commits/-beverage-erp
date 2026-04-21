"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        width: "100%",
        height: "42px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Cerrar sesión
    </button>
  );
}