"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Cog, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Almacen {
  id: number;
  nombre: string;
}

interface Maquinaria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  anioAdquisicion?: number;
  costo: number;
  estado: string;
  almacenId?: number;
  almacen?: { nombre: string };
  createdAt?: string;
}

type SortField = "codigo" | "nombre" | "marca" | "modelo" | "estado" | "costo";
type SortOrder = "asc" | "desc";

export default function MaquinariaPage() {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState<SortField>("codigo");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Form State
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [serie, setSerie] = useState("");
  const [anioAdquisicion, setAnioAdquisicion] = useState("");
  const [costo, setCosto] = useState("0");
  const [estado, setEstado] = useState("OPERATIVO");
  const [almacenId, setAlmacenId] = useState("");

  async function cargarMaquinarias() {
    try {
      const response = await fetch("/api/inventory/maquinaria");
      const data = await response.json();
      setMaquinarias(data);
    } catch (e) {
      toast.error("Error al cargar maquinaria");
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

  useEffect(() => {
    cargarMaquinarias();
    cargarAlmacenes();
  }, []);

  function abrirModal(maq?: Maquinaria) {
    if (maq) {
      setEditandoId(maq.id);
      setNombre(maq.nombre);
      setDescripcion(maq.descripcion || "");
      setUbicacion(maq.ubicacion || "");
      setMarca(maq.marca || "");
      setModelo(maq.modelo || "");
      setSerie(maq.serie || "");
      setAnioAdquisicion(maq.anioAdquisicion ? String(maq.anioAdquisicion) : "");
      setCosto(String(maq.costo));
      setEstado(maq.estado);
      setAlmacenId(maq.almacenId ? String(maq.almacenId) : "");
    } else {
      setEditandoId(null);
      setNombre("");
      setDescripcion("");
      setUbicacion("");
      setMarca("");
      setModelo("");
      setSerie("");
      setAnioAdquisicion("");
      setCosto("0");
      setEstado("OPERATIVO");
      setAlmacenId("");
    }
    setIsDialogOpen(true);
  }

  async function guardarMaquinaria() {
    if (!nombre) {
      toast.warning("El nombre de la maquinaria es obligatorio");
      return;
    }

    try {
      const payload = {
        id: editandoId,
        nombre,
        descripcion,
        ubicacion,
        marca,
        modelo,
        serie,
        anioAdquisicion,
        costo,
        estado,
        almacenId,
      };

      const response = await fetch("/api/inventory/maquinaria", {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      toast.success(editandoId ? "Maquinaria actualizada" : "Maquinaria registrada con éxito");
      setIsDialogOpen(false);
      await cargarMaquinarias();
    } catch (error) {
      toast.error("Error al guardar maquinaria");
    }
  }

  async function eliminarMaquinaria(id: number) {
    if (!confirm("¿Deseas eliminar esta maquinaria de forma permanente? Se borrarán también sus mantenimientos.")) return;

    try {
      const response = await fetch(`/api/inventory/maquinaria/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar");
      }

      toast.success("Maquinaria eliminada");
      await cargarMaquinarias();
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar la maquinaria.");
    }
  }

  async function cambiarEstado(id: number, estadoActual: string) {
    const nuevoEstado = estadoActual === "OPERATIVO" ? "INACTIVO" : "OPERATIVO";
    try {
      const response = await fetch(`/api/inventory/maquinaria/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!response.ok) throw new Error();
      await cargarMaquinarias();
      toast.success(nuevoEstado === "OPERATIVO" ? "Maquinaria activada" : "Maquinaria desactivada");
    } catch (e) {
      toast.error("Error al cambiar el estado");
    }
  }

  const maquinariasFiltradas = maquinarias.filter(
    (m) =>
      m.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.serie?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const maquinariasOrdenadas = [...maquinariasFiltradas].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (valA === undefined || valA === null) valA = "";
    if (valB === undefined || valB === null) valB = "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "OPERATIVO":
        return "bg-emerald-100 text-emerald-700";
      case "EN_MANTENIMIENTO":
        return "bg-amber-100 text-amber-700";
      case "INACTIVO":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Maquinaria</h2>
          <p className="text-sm text-slate-500">Gestión de maquinaria y equipos del almacén</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => abrirModal()} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> Nueva Maquinaria
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Cog className="h-5 w-5 text-slate-500" /> Listado de Maquinaria
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar maquinaria..."
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
                  {renderSortableHeader("marca", "Marca")}
                  {renderSortableHeader("modelo", "Modelo")}
                  <TableHead>Serie</TableHead>
                  <TableHead>Almacén</TableHead>
                  {renderSortableHeader("costo", "Costo", "right")}
                  {renderSortableHeader("estado", "Estado")}
                  <TableHead className="w-[150px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maquinariasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-24 text-slate-500">
                      No se encontró maquinaria registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  maquinariasOrdenadas.map((maq) => (
                    <TableRow key={maq.id}>
                      <TableCell className="font-mono text-xs">{maq.codigo}</TableCell>
                      <TableCell className="font-medium">{maq.nombre}</TableCell>
                      <TableCell>{maq.marca || "—"}</TableCell>
                      <TableCell>{maq.modelo || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{maq.serie || "—"}</TableCell>
                      <TableCell>{maq.almacen?.nombre || "—"}</TableCell>
                      <TableCell className="text-right">S/ {Number(maq.costo).toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(maq.estado)}`}>
                          {maq.estado === "EN_MANTENIMIENTO" ? "En Mtto." : maq.estado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={maq.estado === "OPERATIVO" ? "Desactivar" : "Activar"}
                            className={`h-8 w-8 ${maq.estado === "OPERATIVO" ? "text-orange-500" : "text-green-600"}`}
                            onClick={() => cambiarEstado(maq.id, maq.estado)}
                          >
                            {maq.estado === "OPERATIVO" ? "🚫" : "✅"}
                          </Button>
                          <Button variant="ghost" size="icon" title="Editar" className="h-8 w-8 text-blue-600" onClick={() => abrirModal(maq)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Eliminar" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => eliminarMaquinaria(maq.id)}>
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
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar Maquinaria" : "Nueva Maquinaria"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Nombre de la Maquinaria *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Mezcladora Industrial 500L" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Descripción</Label>
              <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles o especificaciones del equipo" />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ej: CAT, Komatsu" />
            </div>

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Ej: D6T, PC200" />
            </div>

            <div className="space-y-2">
              <Label>Número de Serie</Label>
              <Input value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Ej: SN-2024-001" />
            </div>

            <div className="space-y-2">
              <Label>Año de Adquisición</Label>
              <Input type="number" value={anioAdquisicion} onChange={(e) => setAnioAdquisicion(e.target.value)} placeholder="Ej: 2024" />
            </div>

            <div className="space-y-2">
              <Label>Costo (S/)</Label>
              <Input type="number" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej: Planta principal, Zona A" />
            </div>

            <div className="space-y-2">
              <Label>Almacén</Label>
              <Select value={almacenId} onValueChange={(val) => setAlmacenId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione almacén..." />
                </SelectTrigger>
                <SelectContent>
                  {almacenes.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={(val) => setEstado(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIVO">Operativo</SelectItem>
                  <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={guardarMaquinaria} className="bg-slate-900 hover:bg-slate-800">
              {editandoId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
