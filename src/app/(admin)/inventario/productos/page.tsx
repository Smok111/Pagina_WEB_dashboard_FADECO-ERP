"use client";

import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  nombre: string;
}

interface Unidad {
  id: number;
  codigo: string;
  nombre: string;
}

interface Producto {
  id: number;

  codigoSistema: string;

  nombre: string;
  descripcion?: string;

  categoriaId: number;
  unidadMedidaId: number;

  stockActual: number;
  stockMinimo: number;

  costo: number;
  precioVenta: number;

  estado: boolean;

  categoria: {
    nombre: string;
  };

  unidadMedida: {
    codigo: string;
  };
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [categoriaId, setCategoriaId] = useState("");
  const [unidadMedidaId, setUnidadMedidaId] = useState("");

  const [stockActual, setStockActual] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("0");

  const [costo, setCosto] = useState("0");
  const [precioVenta, setPrecioVenta] = useState("0");
  const [editandoId, setEditandoId] = useState<number | null>(
  null
);

  async function cargarCategorias() {
    const response = await fetch("/api/categorias");
    const data = await response.json();
    setCategorias(data);
  }

  async function cargarUnidades() {
    const response = await fetch("/api/unidades-medida");
    const data = await response.json();
    setUnidades(data);
  }

  async function cargarProductos() {
    const response = await fetch("/api/productos");
    const data = await response.json();
    setProductos(data);
  }
async function guardarProducto() {
  try {
    if (editandoId) {
     const response = await fetch(
  "/api/productos",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  id: editandoId,

  nombre,
  descripcion,
  categoriaId,
  unidadMedidaId,
  stockActual,
  stockMinimo,
  costo,
  precioVenta,
}),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setEditandoId(null);
    } else {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  id: editandoId,

  nombre,
  descripcion,
  categoriaId,
  unidadMedidaId,
  stockActual,
  stockMinimo,
  costo,
  precioVenta,
}),
      });

      if (!response.ok) {
        throw new Error();
      }
    }

    setNombre("");
    setDescripcion("");
    setCategoriaId("");
    setUnidadMedidaId("");
    setStockActual("0");
    setStockMinimo("0");
    setCosto("0");
    setPrecioVenta("0");

    await cargarProductos();

    alert("Producto guardado correctamente");
  } catch (error) {
    console.error(error);
    alert("Error al guardar producto");
  }
}
function editarProducto(producto: any) {
  setEditandoId(producto.id);

  setNombre(producto.nombre);
  setDescripcion(producto.descripcion ?? "");

  setCategoriaId(String(producto.categoriaId));
  setUnidadMedidaId(
    String(producto.unidadMedidaId)
  );

  setStockActual(String(producto.stockActual));
  setStockMinimo(String(producto.stockMinimo));

  setCosto(String(producto.costo));
  setPrecioVenta(String(producto.precioVenta));
}

async function cambiarEstado(
  id: number,
  estadoActual: boolean
) {
  try {
    const response = await fetch(
      `/api/productos/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: !estadoActual,
        }),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    await cargarProductos();
  } catch (error) {
    console.error(error);
  }
}

async function eliminarProducto(id: number) {
  const confirmar = confirm(
    "¿Deseas eliminar este producto?"
  );

  if (!confirmar) return;

  try {
    const response = await fetch(
  "/api/productos",
      {
        method: "DELETE",
        headers: {
  "Content-Type": "application/json",
},

body: JSON.stringify({
  id,
}),
      }
    );

    if (!response.ok) {
      throw new Error();
    }

    await cargarProductos();
  } catch (error) {
    console.error(error);
  }
}

  useEffect(() => {
    cargarCategorias();
    cargarUnidades();
    cargarProductos();
  }, []);
const productosFiltrados = productos.filter(
  (producto) =>
    producto.codigoSistema
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||

    producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||

    producto.categoria.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||

    producto.unidadMedida.codigo
      .toLowerCase()
      .includes(busqueda.toLowerCase())
);
  return (
    <main className="p-8 bg-slate-100 min-h-screen text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Productos
        </h1>

        <p className="text-slate-600 mt-2">
          Administración de productos del inventario.
        </p>
      </div>

      <div className="form-card mb-8">
        <h2 className="section-title">
          {editandoId ? "Editar Producto" : "Nuevo Producto"}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="soft-panel p-4">
            Código Sistema: <strong>Automático</strong>
          </div>

          <div className="space-y-3">
            <label className="field-title">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="field-title">Descripción</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="field-title">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full"
            >
              <option value="">Seleccione Categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="field-title">Unidad</label>
            <select
              value={unidadMedidaId}
              onChange={(e) => setUnidadMedidaId(e.target.value)}
              className="w-full"
            >
              <option value="">Seleccione Unidad</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>{unidad.codigo} - {unidad.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="field-title">Stock Actual</label>
            <input
              value={stockActual}
              onChange={(e) => setStockActual(e.target.value)}
              placeholder="Stock Actual"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="field-title">Stock Mínimo</label>
            <input
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              placeholder="Stock Mínimo"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="field-title">Costo</label>
            <input
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="Costo"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="field-title">Precio Venta</label>
            <input
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              placeholder="Precio Venta"
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button onClick={guardarProducto} className="btn btn-primary">
            {editandoId ? "Actualizar Producto" : "Guardar Producto"}
          </button>
          <button type="button" className="btn btn-secondary">Limpiar</button>
        </div>
      </div>

      <div className="form-card mb-6">
  <h2 className="text-xl font-semibold mb-4">
    🔍 Buscar Producto
  </h2>

  <input
    type="text"
    value={busqueda}
    onChange={(e) =>
      setBusqueda(e.target.value)
    }
    placeholder="Buscar por código, nombre, categoría o unidad..."
    className="w-full border rounded-lg p-3 text-black"
  />
</div>
      <div className="table-card bg-white">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Listado de Productos</h2>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left p-4">Código Sistema</th>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">Categoría</th>
              <th className="text-left p-4">Unidad</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Precio</th>
              <th className="text-left p-4">Estado</th>
              <th className="text-left p-4">
  Acciones
</th>
            </tr>
          </thead>

          <tbody>
           {productosFiltrados.map((producto) => (
              <tr
                key={producto.id}
                className="border-b"
              >
                <td className="p-4 font-mono">
                  {producto.codigoSistema}
                </td>

                <td className="p-4">{producto.nombre}</td>
                <td className="p-4">{producto.categoria.nombre}</td>
                <td className="p-4">{producto.unidadMedida.codigo}</td>
                <td className="p-4">{producto.stockActual}</td>
                <td className="p-4">S/ {producto.precioVenta}</td>

                <td className="p-4">
                  {producto.estado ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Activo
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
  <button
    onClick={() =>
      editarProducto(producto)
    }
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
  >
    ✏️
  </button>


  <button
    onClick={() =>
      eliminarProducto(producto.id)
    }
    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
  >
    🗑️
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}