"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@/providers/AuthProvider";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn(email, password);

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Error al conectar con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-100 opacity-60"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/60">
          
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-28 h-28 bg-white rounded-3xl shadow-[0_10px_40px_rgba(59,130,246,0.3)] border border-blue-100 flex items-center justify-center overflow-hidden p-3"
              >
                <Image src="/logo-fadeco.png" alt="FADECO" width={100} height={100} className="w-full h-full object-contain drop-shadow-sm" />
              </motion.div>
            </motion.div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Bienvenido de nuevo</h1>
            <p className="text-sm text-slate-500">Ingresa tus credenciales para acceder al ERP.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fadeco.com"
                  className={cn(
                    "block w-full pl-11 pr-4 py-3 rounded-xl border-slate-200 bg-white/50 text-sm",
                    "focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all",
                    "placeholder:text-slate-400 text-slate-900"
                  )}
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "block w-full pl-11 pr-4 py-3 rounded-xl border-slate-200 bg-white/50 text-sm",
                    "focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all",
                    "placeholder:text-slate-400 text-slate-900"
                  )}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white",
                "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all",
                "shadow-[0_4px_14px_0_rgb(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-[1px]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Acceder al Sistema
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© 2026 FADECO. Acceso restringido para personal autorizado.</p>
        </div>
      </motion.div>
    </main>
  );
}
