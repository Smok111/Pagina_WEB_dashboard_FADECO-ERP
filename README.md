FADECO ERP es un sistema integral de Planificación de Recursos Empresariales (ERP) diseñado para gestionar todas las áreas principales de la empresa. La aplicación está construida utilizando una arquitectura moderna que separa el Frontend y el Backend para maximizar la escalabilidad, el rendimiento y la facilidad de mantenimiento.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto se divide en dos grandes bloques tecnológicos:

### 1. Frontend (Next.js)
Ubicado en la carpeta `/frontend`, se encarga de toda la interfaz gráfica de usuario y la experiencia visual.
- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes UI:** Shadcn UI, Radix UI
- **Iconos y Animaciones:** Lucide React, Framer Motion
- **Funcionalidades:** Gestión de estado con React Hooks, generación estática/dinámica, manejo de alertas con Sonner.

### 2. Backend (NestJS)
Ubicado en la carpeta `/backend`, se encarga de las reglas de negocio, la conexión a la base de datos y la provisión de una API RESTful.
- **Framework:** NestJS
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma (Gestión del esquema de base de datos y migraciones)
- **Seguridad:** Autenticación y autorización basada en JWT (JSON Web Tokens), Passport y bcryptjs.

---

## 📦 Módulos del Sistema (Funcionalidad)

La aplicación, de acuerdo a la base de datos y la interfaz de usuario, engloba los siguientes módulos empresariales:

### 1. ⚙️ Configuración y Core
- **Empresa y Sucursales:** Gestión de la información matriz de la empresa (RUC, igv, moneda) y sus distintas sedes.
- **Usuarios y Roles:** Control de acceso mediante roles de usuario.
- **Auditoría:** Registro de acciones (quién hizo qué y cuándo) para trazabilidad.

### 2. 📦 Inventario y Almacenes
- **Gestión de Productos:** Creación de ítems, categorías y unidades de medida.
- **Control de Stock:** Visualización de stock actual vs mínimo.
- **Almacenes y Movimientos:** Registro de stock por almacén (Múltiples almacenes) e historial de Movimientos de Inventario (ingresos, salidas, transferencias).

### 3. 🛒 Compras y Proveedores
- **Gestión de Proveedores:** Información de los abastecedores de la empresa.
- **Compras e Ingresos:** Registro de Facturas, Boletas o Guías de compra, las cuales automáticamente alimentan el stock (Inventario).

### 4. 📈 Ventas y Clientes
- **Cartera de Clientes:** Base de datos de clientes con su RUC/DNI.
- **Facturación / Notas de Venta:** Salida de productos, cálculo automático de subtotal, IGV y totales. Resta inventario al completarse.

### 5. 🏭 Producción
- **Órdenes de Producción (OP):** Planificación para crear un producto final.
- **Consumo de Materia Prima:** Descuento directo de almacén de los insumos necesarios para fabricar un producto.
- **Lotes de Fabricación:** Gestión de fechas de vencimiento y estado del lote producido.

### 6. 🛠️ Mantenimiento de Equipos
- Registro de la maquinaria y equipos de la empresa.
- Programación e historial de mantenimientos preventivos y correctivos, incluyendo los costos asociados.

### 7. 👥 Recursos Humanos (RRHH)
- **Trabajadores, Áreas y Cargos:** Base de datos del personal de la empresa.
- **Asistencia y Vacaciones:** Control horario (ingreso/salida) y gestión de vacaciones aprobadas/tomadas.

### 8. 💰 Caja y Bancos
- **Cajas:** Apertura de cajas principales, chicas o cuentas bancarias.
- **Movimientos:** Registro de flujos de dinero (ingresos y egresos).

---

## 🚀 Fases de Ejecución y Desarrollo

El ciclo de desarrollo y ejecución de este proyecto consta de las siguientes fases:

### Fase 1: Configuración del Entorno (Setup)
1. **Instalación de Dependencias:** Ejecutar `npm install` tanto en `/backend` como en `/frontend`.
2. **Variables de Entorno:** Configurar el archivo `.env` en el backend con la URL de la base de datos PostgreSQL (`DATABASE_URL`) y los secretos JWT.
3. **Base de Datos:** Ejecutar `npx prisma db push` o `npx prisma migrate dev` en el backend para generar las tablas en PostgreSQL. También se debe generar el cliente con `npx prisma generate`.

### Fase 2: Ejecución del Entorno de Desarrollo (Dev Mode)
Para trabajar en el proyecto se deben levantar ambos servidores en paralelo:
- **Backend:** `npm run start:dev` en la carpeta `/backend`. (Normalmente corre en el puerto 3001 u 8080).
- **Frontend:** `npm run dev` en la carpeta `/frontend`. (Corre en el puerto 3000 por defecto).

### Fase 3: Pruebas y Compilación (Build Mode)
Antes de llevar a producción, se verifica que el código esté limpio y sin errores de tipeo.
- **Backend:** `npm run build` transpila NestJS y genera la carpeta `/dist`.
- **Frontend:** `npm run build` comprueba el tipado estricto con TypeScript y genera las páginas pre-renderizadas (`.next`). *Cualquier error de TypeScript detendrá la compilación.*

### Fase 4: Despliegue (Producción)
- **Base de datos:** Hosteada en servicios como AWS RDS, Supabase, Neon o Vercel Postgres.
- **Backend:** Hosteado en un VPS o PaaS como Railway, Render, o AWS EC2 mediante `npm run start:prod` (después de haber generado el `dist`).
- **Frontend:** Desplegado idealmente en Vercel o Netlify, configurando las variables de entorno para conectarse con la API en la nube.
