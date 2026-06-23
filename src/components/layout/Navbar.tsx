import Image from "next/image";

export default function Navbar() {
    const fecha = new Date().toLocaleDateString("es-PE");

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-6">
                <button className="p-2 rounded-md hover:bg-slate-100 transition-smooth">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H14M4 18H20" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="hidden sm:flex items-center gap-3">
                    <div className="w-9 h-9">
                        <img src="/logo-fadeco.png" alt="FADECO" className="h-full w-full object-contain" />
                    </div>
                    <div className="hidden md:block">
                        <h2 className="font-semibold">FADECO ERP</h2>
                    </div>
                </div>

                <div className="relative hidden md:block">
                    <input
                        placeholder="Buscar..."
                        className="pl-10 pr-4 py-2 w-72 rounded-lg border border-slate-100 shadow-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="11" cy="11" r="6" stroke="#94a3b8" strokeWidth="1.5" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <span className="text-sm text-slate-500 hidden sm:block">{fecha}</span>

                <button className="p-2 rounded-md hover:bg-slate-100 transition-smooth relative">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 17H9" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 2C9.243 2 7 4.243 7 7v3.5L6 12v1h12v-1l-1-1.5V7c0-2.757-2.243-5-5-5z" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">A</div>
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-sm">Administrador</p>
                        <p className="text-xs text-slate-400">administrador@fadeco.com</p>
                    </div>
                </div>

                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Salir</button>
            </div>
        </header>
    );
}