"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AccessibilityState {
  textSize: "normal" | "large" | "xl";
  contrast: "normal" | "high" | "inverted";
  dyslexia: boolean;
  readingMask: boolean;
  lineSpacing: "normal" | "wide";
  language: string;
  profile: string;
}

interface AccessibilityContextProps {
  state: AccessibilityState;
  updateState: (updates: Partial<AccessibilityState>) => void;
  reset: () => void;
}

const defaultState: AccessibilityState = {
  textSize: "normal",
  contrast: "normal",
  dyslexia: false,
  readingMask: false,
  lineSpacing: "normal",
  language: "Español",
  profile: "Ninguno",
};

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("fadeco_accessibility");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("fadeco_accessibility", JSON.stringify(state));
    }
  }, [state, isMounted]);

  const updateState = (updates: Partial<AccessibilityState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };

      // Aplicar presets si el perfil cambia
      if (updates.profile && updates.profile !== prev.profile) {
        switch (updates.profile) {
          case "Visión Baja":
            next.textSize = "xl";
            next.contrast = "high";
            next.dyslexia = false;
            next.readingMask = false;
            break;
          case "Dislexia":
            next.dyslexia = true;
            next.textSize = "large";
            next.lineSpacing = "wide";
            next.contrast = "normal";
            next.readingMask = false;
            break;
          case "TDHA":
            next.readingMask = true;
            next.dyslexia = false;
            next.contrast = "normal";
            break;
          case "Daltonismo":
            next.contrast = "high"; // Simulación de alto contraste para daltonismo
            next.dyslexia = false;
            next.readingMask = false;
            break;
          case "Ninguno":
            next.textSize = "normal";
            next.contrast = "normal";
            next.dyslexia = false;
            next.readingMask = false;
            next.lineSpacing = "normal";
            break;
        }
      }

      return next;
    });
  };

  const reset = () => {
    setState(defaultState);
  };

  // Apply global classes based on state
  useEffect(() => {
    if (!isMounted) return;

    const html = document.documentElement;

    // Text Size
    html.classList.remove("text-base", "text-lg", "text-xl");
    if (state.textSize === "large") html.classList.add("text-lg");
    if (state.textSize === "xl") html.classList.add("text-xl");

    // Line Spacing
    html.classList.remove("leading-normal", "leading-loose");
    if (state.lineSpacing === "wide") html.classList.add("leading-loose");
    else html.classList.add("leading-normal");

    // Dyslexia
    if (state.dyslexia) {
      html.style.fontFamily = "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif";
    } else {
      html.style.fontFamily = ""; // Revert to layout.tsx font
    }

    // Contrast & Daltonismo
    html.classList.remove("contrast-150", "invert", "grayscale", "hue-rotate-180");
    if (state.contrast === "high") html.classList.add("contrast-150");
    if (state.contrast === "inverted") html.classList.add("invert", "grayscale");
    if (state.profile === "Daltonismo") html.classList.add("contrast-150", "saturate-200");

  }, [state, isMounted]);

  return (
    <AccessibilityContext.Provider value={{ state, updateState, reset }}>
      {children}
      {/* Reading Mask Overlay */}
      {state.readingMask && <ReadingMaskOverlay />}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

export function useTranslations() {
  const { state } = useAccessibility();
  const lang = state.language;

  const t = (key: string) => {
    const dict: Record<string, Record<string, string>> = {
      // Grupos
      "General": { "Inglés": "General", "Quechua": "Tukuy" },
      "Inventario": { "Inglés": "Inventory", "Quechua": "Kanchay" },
      "Operaciones": { "Inglés": "Operations", "Quechua": "Ruraykuna" },
      "Administración": { "Inglés": "Administration", "Quechua": "Kamachiy" },
      "Configuración": { "Inglés": "Settings", "Quechua": "Allichaykuna" },

      // Rutas
      "Dashboard": { "Inglés": "Dashboard", "Quechua": "Qawana Pampa" },
      "Categorías": { "Inglés": "Categories", "Quechua": "Taqakuna" },
      "Unidades": { "Inglés": "Units", "Quechua": "Tupukuna" },
      "Productos": { "Inglés": "Products", "Quechua": "Rurukuna" },
      "Almacenes": { "Inglés": "Warehouses", "Quechua": "Waqaychana" },
      "Compras": { "Inglés": "Purchases", "Quechua": "Rantikuy" },
      "Ventas": { "Inglés": "Sales", "Quechua": "Rantiy" },
      "Producción": { "Inglés": "Production", "Quechua": "Ruray" },
      "Mantenimiento": { "Inglés": "Maintenance", "Quechua": "Allichay" },
      "RRHH": { "Inglés": "HR", "Quechua": "Runakuna" },
      "Finanzas": { "Inglés": "Finance", "Quechua": "Qullqi" },
      "Empresa": { "Inglés": "Company", "Quechua": "Llaqta" },
      "Usuarios": { "Inglés": "Users", "Quechua": "Ruraqkuna" },
      // Dashboard
      "Mega Centro de Control V3": { "Inglés": "Mega Command Center V3", "Quechua": "Hatun Kamachiy Wasi V3" },
      "Análisis en tiempo real de Producción, Finanzas, RRHH y Mantenimiento.": { "Inglés": "Real-time analysis of Production, Finance, HR and Maintenance.", "Quechua": "Kunan pacha qhaway Ruraymanta, Qullqimanta, Runakunamanta, Allichaymantapas." },
      "Exportar Inventario (CSV)": { "Inglés": "Export Inventory (CSV)", "Quechua": "Kanchayta Apachiy (CSV)" },
      "Auditoría Global (PDF)": { "Inglés": "Global Audit (PDF)", "Quechua": "Tukuy Qhaway (PDF)" },
      "Ingresos (7 días)": { "Inglés": "Income (7 days)", "Quechua": "Yaykuq (7 p'unchaw)" },
      "Flujo de Ventas": { "Inglés": "Sales Flow", "Quechua": "Rantiy Puriy" },
      "Egresos (7 días)": { "Inglés": "Expenses (7 days)", "Quechua": "Lluqsiq (7 p'unchaw)" },
      "Gasto en Insumos": { "Inglés": "Supply Expenses", "Quechua": "Qullqi Lluqsiy" },
      "Valor del Inventario": { "Inglés": "Inventory Value", "Quechua": "Kanchay Chanin" },
      "Capital inmovilizado": { "Inglés": "Tied-up Capital", "Quechua": "Qullqi Sayasqa" },
      "Fábrica Activa": { "Inglés": "Active Factory", "Quechua": "Rurana Wasi Kawsachkan" },
      "Órdenes en proceso": { "Inglés": "Orders in process", "Quechua": "Kamachiykuna rurachkan" },
      "Flujo Financiero (Últimos 7 Días)": { "Inglés": "Financial Flow (Last 7 Days)", "Quechua": "Qullqi Puriy (Qhipa 7 P'unchaw)" },
      "Distribución OPs": { "Inglés": "OPs Distribution", "Quechua": "Ruray Rakiy" },
      "Inventario por Categoría": { "Inglés": "Inventory by Category", "Quechua": "Kanchay Taqakunapi" },
      "Sin categorías registradas": { "Inglés": "No categories registered", "Quechua": "Mana taqakuna kanchu" },
      "Top 5 Vendidos": { "Inglés": "Top 5 Best Sellers", "Quechua": "5 Aswan Rantisqa" },
      "Maquinaria (Planta)": { "Inglés": "Machinery (Plant)", "Quechua": "Llamkanakuna" },
      "Fuerza Laboral": { "Inglés": "Workforce", "Quechua": "Llamkaqkuna" },
      "Mantenimientos Pendientes": { "Inglés": "Pending Maintenance", "Quechua": "Allichaykuna Suyachkan" },
      "Stock Crítico": { "Inglés": "Critical Stock", "Quechua": "Pisi Kanchay" },
      "No tienes notificaciones": { "Inglés": "No notifications", "Quechua": "Mana willaykuna kanchu" },
      "Notificaciones": { "Inglés": "Notifications", "Quechua": "Willaykuna" },
    };

    if (lang === "Español") return key;
    return dict[key]?.[lang] || key;
  };

  return { t };
}

function ReadingMaskOverlay() {
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMouseY(e.clientY);
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        background: `
          linear-gradient(
            to bottom,
            rgba(0,0,0,0.6) 0%,
            rgba(0,0,0,0.6) ${mouseY - 50}px,
            transparent ${mouseY - 50}px,
            transparent ${mouseY + 50}px,
            rgba(0,0,0,0.6) ${mouseY + 50}px,
            rgba(0,0,0,0.6) 100%
          )
        `,
      }}
    />
  );
}
