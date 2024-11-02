// src/pages/_app.tsx
import "../styles/globals.css";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { LanguageProvider } from "../contexts/LanguageContext";
import { Sidebar } from "../components/Sidebar";
import { useState } from "react";
import type { AppProps } from "next/app";
import { PrimeReactProvider } from 'primereact/api';
// Asegúrate de importar el tema de PrimeReact (por ejemplo, "vela-blue")
import "primereact/resources/themes/vela-blue/theme.css"; // Tema con interacción celeste
import "primereact/resources/primereact.min.css"; // Estilos base de PrimeReact
import "primeicons/primeicons.css"; // Iconos de PrimeReact


function MyApp({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <PrimeReactProvider>
    <LanguageProvider>
      <ThemeProvider>
        <div className="flex h-screen">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className={`${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300 w-full`}>
            <Component {...pageProps} />
          </main>
        </div>
      </ThemeProvider>
    </LanguageProvider>
    </PrimeReactProvider>
  );
}

export default MyApp;
