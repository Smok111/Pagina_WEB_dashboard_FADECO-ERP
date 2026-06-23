"use client";

import { useState } from "react";

export default function DateFilter({ start, end, onChange }: { start?: string; end?: string; onChange: (s?: string, e?: string) => void }) {
  const [s, setS] = useState(start ?? '');
  const [e, setE] = useState(end ?? '');

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Desde</span>
        <input type="date" value={s} onChange={(ev) => setS(ev.target.value)} className="rounded-2xl border-slate-200 bg-slate-50 px-3 py-2" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Hasta</span>
        <input type="date" value={e} onChange={(ev) => setE(ev.target.value)} className="rounded-2xl border-slate-200 bg-slate-50 px-3 py-2" />
      </div>

      <button type="button" className="btn btn-primary" onClick={() => onChange(s || undefined, e || undefined)}>Aplicar</button>
      <button type="button" className="btn btn-ghost text-slate-600" onClick={() => { setS(''); setE(''); onChange(undefined, undefined); }}>Limpiar</button>
    </div>
  );
}
