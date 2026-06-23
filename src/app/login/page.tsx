"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Ingresa usuario y contraseña para continuar.");
      return;
    }

    setError(null);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] bg-white/95 p-8 shadow-[0_28px_90px_rgba(15,23,42,0.22)] ring-1 ring-white/80 backdrop-blur-xl sm:p-10">
        <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-16 right-10 h-44 w-44 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 sm:grid-cols-[1fr_240px] sm:items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-3xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
              <div className="h-14 w-14 overflow-hidden rounded-3xl bg-slate-950/5 p-2">
                <Image
                  src="/logo-fadeco.png"
                  alt="Logo FADECO"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-slate-950">FADECO ERP</span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Bienvenido a FADECO ERP
              </h1>
              <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
                Accede rápido a inventarios, compras y reportes con una interfaz renovada y limpia.
              </p>
            </div>
          </div>

          <div className="relative rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,0.3)] ring-1 ring-white/10">
            <div className="mb-5 flex items-center justify-between rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-200">
              <span>FADECO</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Login</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@empresa.com"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                />
              </div>

              {error ? (
                <div className="rounded-3xl border border-red-500/20 bg-red-50/90 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="w-full rounded-3xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-red-500/20 transition hover:scale-[1.01] hover:shadow-red-500/30 focus:outline-none focus:ring-4 focus:ring-red-500/25">
                Ingresar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
