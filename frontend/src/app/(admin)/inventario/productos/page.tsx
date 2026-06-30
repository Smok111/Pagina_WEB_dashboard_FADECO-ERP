"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, Search, Package, Upload, FileSpreadsheet, ClipboardList, Download, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Categoría {
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
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  unidadMedidaId: number;
  stockActual: number;
  stockMinimo: number;
  costo: number;
  precioVenta: number;
  estado: boolean;
  categoria: { nombre: string };
  unidadMedida: { codigo: string };
  createdAt?: string;
}

type SortField = "codigo" | "nombre" | "categoria" | "stockActual" | "precioVenta" | "createdAt";
type SortOrder = "asc" | "desc";

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState<SortField>("codigo");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
  const [kardexData, setKardexData] = useState<any[]>([]);
  const [kardexProducto, setKardexProducto] = useState<Producto | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [unidadMedidaId, setUnidadMedidaId] = useState("");
  const [almacenId, setAlmacenId] = useState("");
  const [stockActual, setStockActual] = useState("0");
  const [stockMinimo, setStockMinimo] = useState("0");
  const [costo, setCosto] = useState("0");
  const [precioVenta, setPrecioVenta] = useState("0");

  async function cargarCategorias() {
    try {
      const response = await fetch("/api/inventory/categorias");
      const data = await response.json();
      setCategorias(data);
    } catch (e) {
      toast.error("Error al cargar categorías");
    }
  }

  async function cargarUnidades() {
    try {
      const response = await fetch("/api/inventory/unidades-medida");
      const data = await response.json();
      setUnidades(data);
    } catch (e) {
      toast.error("Error al cargar unidades");
    }
  }

  async function cargarAlmacenes() {
    try {
      const response = await fetch("/api/inventory/almacenes");
      const data = await response.json();
      setAlmacenes(data);
    } catch (e) {
      toast.error("Error al cargar almacenes");
    }
  }

  async function cargarProductos() {
    try {
      const response = await fetch("/api/inventory/productos");
      const data = await response.json();
      setProductos(data);
    } catch (e) {
      toast.error("Error al cargar productos");
    }
  }

  useEffect(() => {
    cargarCategorias();
    cargarUnidades();
    cargarAlmacenes();
    cargarProductos();
  }, []);

  function abrirModal(producto?: Producto) {
    if (producto) {
      setEditandoId(producto.id);
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion || "");
      setCategoriaId(String(producto.categoriaId));
      setUnidadMedidaId(String(producto.unidadMedidaId));
      setAlmacenId(""); // Para edición de stock se usa Movimientos
      setStockActual(String(producto.stockActual));
      setStockMinimo(String(producto.stockMinimo));
      setCosto(String(producto.costo));
      setPrecioVenta(String(producto.precioVenta));
    } else {
      setEditandoId(null);
      setNombre("");
      setDescripcion("");
      setCategoriaId("");
      setUnidadMedidaId("");
      setAlmacenId("");
      setStockActual("0");
      setStockMinimo("0");
      setCosto("0");
      setPrecioVenta("0");
    }
    setIsDialogOpen(true);
  }

  async function guardarProducto() {
    if (!nombre || !categoriaId || !unidadMedidaId) {
      toast.warning("Por favor complete los campos obligatorios");
      return;
    }

    try {
      const payload = {
        id: editandoId,
        nombre,
        descripcion,
        categoriaId,
        unidadMedidaId,
        almacenId,
        stockActual,
        stockMinimo,
        costo,
        precioVenta,
      };

      const response = await fetch("/api/inventory/productos", {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      toast.success(editandoId ? "Producto actualizado" : "Producto creado con éxito");
      setIsDialogOpen(false);
      await cargarProductos();
    } catch (error) {
      toast.error("Error al guardar producto");
    }
  }

  async function eliminarProducto(id: number) {
    if (!confirm("¿Deseas eliminar este producto de forma permanente?")) return;

    try {
      const response = await fetch("/api/inventory/productos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error();

      toast.success("Producto eliminado");
      await cargarProductos();
    } catch (error) {
      toast.error("No se pudo eliminar el producto");
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setImportData(data);
        if (data.length === 0) toast.warning("El archivo parece estar vacío");
      } catch (err) {
        toast.error("Error al leer el archivo. Asegúrate de que sea Excel o CSV.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const procesarImportacion = async () => {
    if (importData.length === 0) return toast.error("El archivo está vacío");
    try {
      const payload = importData.map(row => ({
        nombre: row["Nombre"] || row["nombre"] || row["NOMBRE"] || "Sin nombre",
        descripcion: row["Descripción"] || row["descripcion"] || row["DESCRIPCION"] || "",
        stockActual: row["Stock"] || row["stock"] || row["STOCK"] || 0,
        stockMinimo: row["StockMinimo"] || row["stockMinimo"] || 0,
        costo: row["Costo"] || row["costo"] || row["COSTO"] || 0,
        precioVenta: row["Precio"] || row["precio"] || row["PRECIO"] || 0,
      }));

      const res = await fetch("/api/inventory/productos/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();

      toast.success(`${importData.length} productos importados correctamente`);
      setIsImportModalOpen(false);
      setImportData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await cargarProductos();
    } catch (e) {
      toast.error("Error al procesar la importación masiva en el servidor");
    }
  };

  const abrirKardex = async (producto: Producto) => {
    setKardexProducto(producto);
    setIsKardexModalOpen(true);
    setKardexData([]);
    try {
      const res = await fetch(`/api/inventory/productos/${producto.id}/kardex`);
      const data = await res.json();
      setKardexData(data);
    } catch (e) {
      toast.error("Error al cargar Kardex");
    }
  };

  const descargarKardexPDF = () => {
    if (!kardexProducto) return;
    const doc = new jsPDF();
    doc.text(`Reporte de Kardex - ${kardexProducto.nombre}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Código: ${kardexProducto.codigo} | Stock Actual: ${kardexProducto.stockActual}`, 14, 28);

    const tableColumn = ["Fecha", "Almacén", "Tipo", "Observación", "Cantidad", "Saldo"];
    const tableRows = kardexData.map(m => [
      new Date(m.fecha).toLocaleString(),
      m.almacen?.nombre || "N/A",
      m.tipo,
      m.observacion || "",
      m.tipo === "INGRESO" ? `+${m.cantidad}` : `-${m.cantidad}`,
      m.saldo
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`Kardex_${kardexProducto.codigo}.pdf`);
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === "categoria") {
      valA = a.categoria?.nombre || "";
      valB = b.categoria?.nombre || "";
    }

    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortableHeader = (field: SortField, label: string, align: "left" | "right" = "left") => {
    return (
      <TableHead 
        className={`cursor-pointer select-none hover:bg-slate-100 ${align === "right" ? "text-right" : ""}`} 
        onClick={() => {
          if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
            setSortField(field);
            setSortOrder("asc");
          }
        }}
      >
        <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
          {label}
          {sortField === field ? (
            sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 text-slate-300" />
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Productos</h2>
          <p className="text-sm text-slate-500">Gestión de maestro de artículos y stock</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="bg-white hover:bg-slate-50 border-slate-200">
            <Upload className="mr-2 h-4 w-4 text-emerald-600" /> Importar Excel
          </Button>
          <Button onClick={() => abrirModal()} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-500" /> Listado de Inventario
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {renderSortableHeader("codigo", "Código")}
                  {renderSortableHeader("nombre", "Nombre")}
                  {renderSortableHeader("categoria", "Categoría")}
                  <TableHead>Unidad</TableHead>
                  {renderSortableHeader("stockActual", "Stock", "right")}
                  {renderSortableHeader("precioVenta", "Precio", "right")}
                  {renderSortableHeader("createdAt", "Fecha Creado", "right")}
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-slate-500">
                      No se encontraron productos.
                    </TableCell>
                  </TableRow>
                ) : (
                  productosOrdenados.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-mono text-xs">{producto.codigo}</TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>{producto.categoria.nombre}</TableCell>
                      <TableCell>{producto.unidadMedida.codigo}</TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={producto.stockActual <= producto.stockMinimo ? "text-red-600" : "text-green-600"}>
                          {producto.stockActual}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">S/ {producto.precioVenta}</TableCell>
                      <TableCell className="text-right text-xs text-slate-500">
                        {producto.createdAt ? new Date(producto.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" title="Ver Kardex" className="h-8 w-8 text-emerald-600" onClick={() => abrirKardex(producto)}>
                            <ClipboardList className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => abrirModal(producto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => eliminarProducto(producto.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Nombre del Producto *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cemento Portland Tipo I" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Descripción</Label>
              <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles del producto" />
            </div>

            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={categoriaId} onValueChange={(val) => setCategoriaId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unidad de Medida *</Label>
              <Select value={unidadMedidaId} onValueChange={(val) => setUnidadMedidaId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione..." />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.nombre} ({u.codigo})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Almacén (Para Stock Inicial)</Label>
              <Select value={almacenId} onValueChange={(val) => setAlmacenId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {almacenes.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stock Actual</Label>
              <Input type="number" value={stockActual} onChange={(e) => setStockActual(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Stock Mínimo</Label>
              <Input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Costo (S/)</Label>
              <Input type="number" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Precio de Venta (S/)</Label>
              <Input type="number" step="0.01" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={guardarProducto} className="bg-slate-900 hover:bg-slate-800">
              {editandoId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="text-emerald-600" /> Importación Masiva</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-2">Instrucciones:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sube un archivo `.xlsx` o `.csv`</li>
                <li>Las columnas recomendadas son: <strong>Nombre, Descripcion, Stock, Costo, Precio</strong></li>
                <li>El sistema autogenerará los códigos correlativos.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Seleccionar archivo Excel/CSV</Label>
              <Input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="cursor-pointer"
              />
            </div>

            {importData.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                <span className="text-emerald-800 text-sm font-medium">Archivo cargado exitosamente.</span>
                <span className="bg-emerald-600 text-white px-2 py-1 rounded-md text-xs font-bold">{importData.length} Filas detectadas</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsImportModalOpen(false); setImportData([]); }}>Cancelar</Button>
            <Button onClick={procesarImportacion} disabled={importData.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
              Importar {importData.length > 0 ? importData.length : ""} Productos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isKardexModalOpen} onOpenChange={setIsKardexModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="text-emerald-600" />
                Auditoría Kardex
              </DialogTitle>
              <Button onClick={descargarKardexPDF} variant="outline" size="sm" className="h-8 border-slate-200">
                <Download className="mr-2 h-4 w-4 text-red-600" /> Exportar PDF
              </Button>
            </div>
            <DialogDescription>
              Historial de movimientos para: <strong className="text-slate-800">{kardexProducto?.nombre}</strong> (Cód: {kardexProducto?.codigo})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md border max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 sticky top-0">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Almacén</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Observación</TableHead>
                    <TableHead className="text-right">Mov.</TableHead>
                    <TableHead className="text-right font-bold">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kardexData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                        No hay movimientos registrados para este producto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    kardexData.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell className="text-xs text-slate-500">{new Date(mov.fecha).toLocaleString()}</TableCell>
                        <TableCell>{mov.almacen?.nombre}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${mov.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {mov.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{mov.observacion}</TableCell>
                        <TableCell className={`text-right font-mono font-bold ${mov.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mov.tipo === 'INGRESO' ? '+' : '-'}{mov.cantidad}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-slate-900">{mov.saldo}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKardexModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}