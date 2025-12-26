import React, { ReactNode } from "react";
import "../globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ display:"flex", justifyContent:"center" }}>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
