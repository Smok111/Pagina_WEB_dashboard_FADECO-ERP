"use client";

import { X, Type, Contrast, MousePointer2, AlignJustify, EyeOff, BookOpen, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AccessibilityMenu() {
  const { state, updateState, reset } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const UniversalAccessIcon = ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2"/>
      <path d="m5 8 7-1 7 1"/>
      <path d="m12 14-3 8"/>
      <path d="m12 14 3 8"/>
      <path d="m12 7v7"/>
    </svg>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)] transition-all duration-300 outline-none hover:scale-110 active:scale-95",
          isOpen ? "bg-slate-800 hover:bg-slate-700" : "bg-blue-600 hover:bg-blue-500"
        )}
        title="Accesibilidad"
      >
        {isOpen ? <X size={24} /> : <UniversalAccessIcon />}
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[9990] lg:hidden" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden z-[9999] flex flex-col p-4 origin-bottom-right"
            >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="m3 11 8-2 8 2"/><path d="m12 9v7"/><path d="m8 22 4-6 4 6"/></svg>
                </span>
                Menú de accesibilidad
              </h3>
            </div>

            {/* Selectors */}
            <div className="space-y-3 mb-4">
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Idioma:</span>
                <select 
                  value={state.language}
                  onChange={(e) => updateState({ language: e.target.value })}
                  className="bg-transparent text-sm font-semibold text-blue-600 outline-none text-right"
                >
                  <option value="Español">ES Español</option>
                  <option value="Inglés">EN Inglés</option>
                  <option value="Quechua">PE Quechua</option>
                </select>
              </div>

              <div className="bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Perfil:</span>
                <select 
                  value={state.profile}
                  onChange={(e) => updateState({ profile: e.target.value })}
                  className="bg-transparent text-sm font-semibold text-blue-600 outline-none text-right"
                >
                  <option value="Ninguno">Ninguno</option>
                  <option value="Visión Baja">Visión Baja</option>
                  <option value="Dislexia">Dislexia</option>
                  <option value="TDHA">TDHA</option>
                  <option value="Daltonismo">Daltonismo</option>
                </select>
              </div>
            </div>

            {/* Grid Tools */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Tamaño de texto */}
              <button 
                onClick={() => updateState({ textSize: state.textSize === "normal" ? "large" : state.textSize === "large" ? "xl" : "normal" })}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  state.textSize !== "normal" ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <Type size={24} className={state.textSize !== "normal" ? "text-blue-600" : "text-slate-600"} />
                <span className="text-[11px] font-bold text-slate-700">Tamaño de texto</span>
                <div className="flex gap-1 mt-1">
                  <div className={cn("h-1 w-3 rounded-full", state.textSize === "normal" ? "bg-slate-300" : "bg-blue-600")} />
                  <div className={cn("h-1 w-3 rounded-full", state.textSize === "large" || state.textSize === "xl" ? "bg-blue-600" : "bg-slate-300")} />
                  <div className={cn("h-1 w-3 rounded-full", state.textSize === "xl" ? "bg-blue-600" : "bg-slate-300")} />
                </div>
              </button>

              {/* Contrastes */}
              <button 
                onClick={() => updateState({ contrast: state.contrast === "normal" ? "high" : state.contrast === "high" ? "inverted" : "normal" })}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  state.contrast !== "normal" ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <Contrast size={24} className={state.contrast !== "normal" ? "text-blue-600" : "text-slate-600"} />
                <span className="text-[11px] font-bold text-slate-700">Contrastes</span>
                <div className="flex gap-1 mt-1">
                  <div className={cn("h-1 w-4 rounded-full", state.contrast === "normal" ? "bg-slate-300" : "bg-blue-600")} />
                </div>
              </button>

              {/* Cursor */}
              <button 
                className="p-4 rounded-xl border bg-white border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-all duration-200"
              >
                <MousePointer2 size={24} className="text-slate-600" />
                <span className="text-[11px] font-bold text-slate-700">Cursor (Próximamente)</span>
                <div className="flex gap-1 mt-1">
                  <div className="h-1 w-4 rounded-full bg-slate-300" />
                </div>
              </button>

              {/* Máscara de lectura */}
              <button 
                onClick={() => updateState({ readingMask: !state.readingMask })}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  state.readingMask ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <EyeOff size={24} className={state.readingMask ? "text-blue-600" : "text-slate-600"} />
                <span className="text-[11px] font-bold text-slate-700 text-center">Máscara de lectura</span>
                <div className="flex gap-1 mt-1">
                  <div className={cn("h-1 w-4 rounded-full", state.readingMask ? "bg-blue-600" : "bg-slate-300")} />
                </div>
              </button>

              {/* Dislexia amigable */}
              <button 
                onClick={() => updateState({ dyslexia: !state.dyslexia })}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  state.dyslexia ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <span className={cn("text-xl font-serif font-bold", state.dyslexia ? "text-blue-600" : "text-slate-600")}>AZ</span>
                <span className="text-[11px] font-bold text-slate-700 text-center">Dislexia amigable</span>
                <div className="flex gap-1 mt-1">
                  <div className={cn("h-1 w-4 rounded-full", state.dyslexia ? "bg-blue-600" : "bg-slate-300")} />
                </div>
              </button>

              {/* Interlineado */}
              <button 
                onClick={() => updateState({ lineSpacing: state.lineSpacing === "normal" ? "wide" : "normal" })}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200",
                  state.lineSpacing !== "normal" ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                )}
              >
                <AlignJustify size={24} className={state.lineSpacing !== "normal" ? "text-blue-600" : "text-slate-600"} />
                <span className="text-[11px] font-bold text-slate-700">Interlineado</span>
                <div className="flex gap-1 mt-1">
                  <div className={cn("h-1 w-3 rounded-full", state.lineSpacing === "normal" ? "bg-slate-300" : "bg-blue-600")} />
                  <div className={cn("h-1 w-3 rounded-full", state.lineSpacing === "wide" ? "bg-blue-600" : "bg-slate-300")} />
                </div>
              </button>
            </div>

            {/* Restablecer */}
            <div className="pt-2 border-t border-slate-100">
              <button 
                onClick={reset}
                className="w-full py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Restablecer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
