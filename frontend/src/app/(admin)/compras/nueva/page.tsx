"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, X, Search } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Almacén {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  codigoSistema: string;
  nombre: string;
  costo: number;
}

interface Proveedor {
  id: number;
  razonSocial: string;
  ruc: string;
}

interface DetalleCompra {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export default function NuevaCompraPage() {
  const router = useRouter();
  
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Header State
  const [almacenId, setAlmacenId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("FACTURA");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observacion, setObservacion] = useState("");
  const [estado, setEstado] = useState("PENDIENTE");

  // Detail State
  const [detalles, setDetalles] = useState<DetalleCompra[]>([]);
  const [selectedProducto, setSelectedProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);

  // New Provider State
  const [isNewProviderModalOpen, setIsNewProviderModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    ruc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    correo: "",
    contacto: ""
  });
  const [isSearchingProvider, setIsSearchingProvider] = useState(false);

  // Loaders
  useEffect(() => {
    async function loadData() {
      try {
        const [almacenesRes, productosRes, proveedoresRes] = await Promise.all([
          fetch("/api/inventory/almacenes"),
          fetch("/api/inventory/productos"),
          fetch("/api/purchases/proveedores").catch(() => null),
        ]);
        
        if (almacenesRes.ok) setAlmacenes(await almacenesRes.json());
        if (productosRes.ok) setProductos(await productosRes.json());
        if (proveedoresRes?.ok) {
          setProveedores(await proveedoresRes.json());
        } else {
          // Mock Provider for demonstration if API isn't ready
          setProveedores([
            { id: 1, razonSocial: "Proveedor General SAC", ruc: "20123456789" },
            { id: 2, razonSocial: "Distribuidora Lima EIRL", ruc: "10987654321" }
          ]);
        }
      } catch (e) {
        toast.error("Error al cargar datos iniciales");
      }
    }
    loadData();
  }, []);

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/purchases/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProvider)
      });
      if (res.ok) {
        const created = await res.json();
        setProveedores([...proveedores, created]);
        setProveedorId(String(created.id));
        setIsNewProviderModalOpen(false);
        setNewProvider({ ruc: "", razonSocial: "", direccion: "", telefono: "", correo: "", contacto: "" });
        toast.success("Proveedor creado exitosamente");
      }
    } catch (err) {
      toast.error("Error al crear proveedor");
    }
  };

  const buscarProveedorPorRuc = async () => {
    if (!newProvider.ruc) return;
    
    setIsSearchingProvider(true);
    try {
      const res = await fetch(`/api-apis-net-pe/ruc?numero=${newProvider.ruc}`);
      if (res.ok) {
        const data = await res.json();
        setNewProvider({
          ...newProvider,
          razonSocial: data.nombre || "",
          direccion: data.direccion || "",
        });
      } else {
        toast.error("No se encontraron resultados para el RUC ingresado.");
      }
    } catch (error) {
      console.error("Error buscando RUC:", error);
    } finally {
      setIsSearchingProvider(false);
    }
  };

  const handleAddDetalle = () => {
    if (!selectedProducto || cantidad <= 0 || precioUnitario <= 0) {
      toast.warning("Complete el producto, cantidad y precio válido");
      return;
    }

    const producto = productos.find(p => p.id.toString() === selectedProducto);
    if (!producto) return;

    const existing = detalles.find(d => d.productoId === producto.id);
    if (existing) {
      toast.warning("El producto ya está en la lista. Edite su cantidad o elimínelo.");
      return;
    }

    setDetalles([
      ...detalles,
      {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad,
        precioUnitario,
        subtotal: cantidad * precioUnitario,
      }
    ]);

    setSelectedProducto("");
    setCantidad(1);
    setPrecioUnitario(0);
  };

  const removeDetalle = (id: number) => {
    setDetalles(detalles.filter(d => d.productoId !== id));
  };

  // Calculations
  const calcSubtotal = detalles.reduce((acc, curr) => acc + curr.subtotal, 0);
  const igv = tipoDocumento === "FACTURA" ? calcSubtotal * 0.18 : 0;
  const total = calcSubtotal + igv;

  const handleSave = async () => {
    if (!almacenId || !proveedorId || !numeroDocumento || detalles.length === 0) {
      toast.error("Faltan datos obligatorios (Almacén, Proveedor, N° Doc y Detalles)");
      return;
    }

    try {
      const payload = {
        fecha,
        tipoDocumento,
        numeroDocumento,
        estado,
        observacion,
        proveedorId: Number(proveedorId),
        almacenId: Number(almacenId),
        subtotal: calcSubtotal,
        igv,
        total,
        detalles,
      };

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success(estado === "RECIBIDA" ? "Compra registrada y stock actualizado" : "Compra registrada correctamente");
      router.push("/compras");
    } catch (e) {
      toast.error("Ocurrió un error al guardar la compra");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nueva Compra</h2>
          <p className="text-sm text-slate-500">Registrar ingreso de mercadería e inventario</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/compras")}>
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800">
            <Save className="mr-2 h-4 w-4" /> Guardar Compra
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Documento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Proveedor *</Label>
                  <button type="button" onClick={() => setIsNewProviderModalOpen(true)} className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                    <Plus size={12}/> Nuevo Proveedor
                  </button>
                </div>
                <Select value={proveedorId} onValueChange={(val) => setProveedorId(val || "")}>
                  <SelectTrigger><SelectValue placeholder="Seleccione Proveedor" /></SelectTrigger>
                  <SelectContent>
                    {proveedores.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.razonSocial}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Almacén de Destino *</Label>
                <Select value={almacenId} onValueChange={(val) => setAlmacenId(val || "")}>
                  <SelectTrigger><SelectValue placeholder="Seleccione Almacén" /></SelectTrigger>
                  <SelectContent>
                    {almacenes.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={tipoDocumento} onValueChange={(val) => setTipoDocumento(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FACTURA">Factura</SelectItem>
                    <SelectItem value="BOLETA">Boleta</SelectItem>
                    <SelectItem value="GUIA">Guía de Remisión</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número de Documento *</Label>
                <Input value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} placeholder="F001-000456" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Emisión</Label>
                <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select value={estado} onValueChange={(val) => setEstado(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente (No suma stock)</SelectItem>
                    <SelectItem value="RECIBIDA">Recibida (Ingresa a stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Observaciones</Label>
                <Input value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Anotaciones adicionales..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalle de Productos</CardTitle>
              <CardDescription>Agrega los items de la compra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-4 rounded-lg border">
                <div className="col-span-5 space-y-2">
                  <Label>Producto</Label>
                  <Select value={selectedProducto} onValueChange={(val) => {
                    setSelectedProducto(val || "");
                    const prod = productos.find(p => p.id.toString() === val);
                    if (prod) setPrecioUnitario(prod.costo);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent>
                      {productos.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Cantidad</Label>
                  <Input type="number" min="1" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Precio Unit. (S/)</Label>
                  <Input type="number" step="0.01" value={precioUnitario} onChange={e => setPrecioUnitario(Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Button type="button" onClick={handleAddDetalle} className="w-full bg-slate-900 hover:bg-slate-800">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                          No hay productos agregados
                        </TableCell>
                      </TableRow>
                    ) : (
                      detalles.map(d => (
                        <TableRow key={d.productoId}>
                          <TableCell className="font-medium">{d.productoNombre}</TableCell>
                          <TableCell className="text-right">{d.cantidad}</TableCell>
                          <TableCell className="text-right">{formatCurrency(d.precioUnitario)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(d.subtotal)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => removeDetalle(d.productoId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(calcSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>IGV (18%) {tipoDocumento !== "FACTURA" && "(N/A)"}</span>
                <span className="font-medium text-slate-900">{formatCurrency(igv)}</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-base font-semibold text-slate-900">Total General</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isNewProviderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-blue-500" /> Nuevo Proveedor
              </h3>
              <button onClick={() => setIsNewProviderModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">RUC *</Label>
                  <div className="flex gap-2">
                    <Input required value={newProvider.ruc} onChange={e => setNewProvider({...newProvider, ruc: e.target.value})} />
                    <Button type="button" variant="outline" size="icon" onClick={buscarProveedorPorRuc} disabled={isSearchingProvider} className="shrink-0">
                      {isSearchingProvider ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> : <Search size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="mb-1.5 block">Razón Social *</Label>
                  <Input required value={newProvider.razonSocial} onChange={e => setNewProvider({...newProvider, razonSocial: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1.5 block">Dirección</Label>
                  <Input value={newProvider.direccion} onChange={e => setNewProvider({...newProvider, direccion: e.target.value})} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Teléfono</Label>
                  <Input value={newProvider.telefono} onChange={e => setNewProvider({...newProvider, telefono: e.target.value})} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Correo</Label>
                  <Input type="email" value={newProvider.correo} onChange={e => setNewProvider({...newProvider, correo: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1.5 block">Contacto Principal</Label>
                  <Input value={newProvider.contacto} onChange={e => setNewProvider({...newProvider, contacto: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsNewProviderModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" /> Guardar Proveedor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
