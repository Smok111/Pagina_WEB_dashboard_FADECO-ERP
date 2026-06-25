"use client";

import { useEffect, useState } from "react";

interface Producto {
  id: number;
  nombre: string;
}

interface Props {
  onSelect: (producto: Producto) => void;
}

export default function BuscadorProducto({
  onSelect,
}: Props) {
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscando, setBuscando] = useState(false);

  async function buscarProducto(
    valor: string
  ) {
    try {
      setBuscando(true);

      const response = await fetch(
        `/api/productos/buscar?texto=${encodeURIComponent(
          valor
        )}`
      );

      const data =
        await response.json();

      setProductos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setBuscando(false);
    }
  }

  useEffect(() => {
    if (texto.trim().length < 2) {
      setProductos([]);
      return;
    }

    const timer = setTimeout(() => {
      buscarProducto(texto);
    }, 300);

    return () => clearTimeout(timer);
  }, [texto]);

  return (
    <div className="relative w-full">

      <input
        value={texto}
        onChange={(e) =>
          setTexto(e.target.value)
        }
        placeholder="🔍 Buscar producto..."
        className="border rounded-lg p-3 w-full bg-white"
      />

      {buscando && (
        <div
          className="
            absolute
            top-full
            left-0
            mt-1
            w-full
            bg-white
            border-2
            border-slate-300
            rounded-lg
            shadow-2xl
            z-[99999]
            p-3
          "
        >
          Buscando...
        </div>
      )}

      {!buscando &&
        productos.length > 0 && (

        <div
          className="
            absolute
            top-full
            left-0
            mt-1
            min-w-[300px]
            bg-white
            border-2
            border-slate-300
            rounded-lg
            shadow-2xl
            z-[99999]
            max-h-72
            overflow-y-auto
          "
        >

          {productos.map((producto) => (

            <div
              key={producto.id}
              onClick={() => {
  onSelect(producto);

  setTexto("");

  setProductos([]);
}}
              className="
                p-3
                hover:bg-slate-100
                cursor-pointer
                border-b
                text-black
              "
            >
              {producto.nombre}
            </div>

          ))}

        </div>

      )}

      {!buscando &&
        texto.trim().length >= 2 &&
        productos.length === 0 && (

        <div
          className="
            absolute
            top-full
            left-0
            mt-1
            min-w-[300px]
            bg-white
            border-2
            border-slate-300
            rounded-lg
            shadow-2xl
            z-[99999]
            p-4
          "
        >

          <p className="text-slate-600">
            No se encontraron productos
          </p>

          <button
            type="button"
            className="
              mt-3
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2
              rounded-lg
            "
            onClick={() => {
              alert(
                "Próximamente se abrirá el formulario de creación de productos."
              );
            }}
          >
            + Crear Producto Nuevo
          </button>

        </div>

      )}

    </div>
  );
}