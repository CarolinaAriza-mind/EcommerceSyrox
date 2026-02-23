# 🛒 Tech House

Panel administrativo completo para gestión de ecommerce, desarrollado como prueba técnica. Incluye autenticación, gestión de productos, categorías, ventas, clientes y marcas con una interfaz moderna y responsiva.

---

## 🚀 Stack Tecnológico

**Backend**
- [NestJS](https://nestjs.com/) — Framework Node.js escalable
- [Prisma ORM](https://www.prisma.io/) — ORM moderno con migraciones
- [PostgreSQL](https://www.postgresql.org/) — Base de datos relacional
- [JWT](https://jwt.io/) — Autenticación con tokens
- [Cloudinary](https://cloudinary.com/) — Almacenamiento de imágenes
- [Multer](https://github.com/expressjs/multer) — Manejo de archivos multipart

**Frontend**
- [Next.js 15](https://nextjs.org/) — Framework React con App Router
- [React 19](https://react.dev/) — Biblioteca de UI
- [TailwindCSS v4](https://tailwindcss.com/) — Estilos utilitarios
- [shadcn/ui](https://ui.shadcn.com/) — Componentes de UI
- [Lucide React](https://lucide.dev/) — Iconografía

---

## 📁 Estructura del Proyecto

```
EcommerceSyrox/
├── adminsyrox/          # Backend NestJS
│   ├── src/
│   │   ├── auth/        # Módulo de autenticación JWT
│   │   ├── brands/      # Módulo de marcas
│   │   ├── categories/  # Módulo de categorías
│   │   ├── cloudinary/  # Servicio de imágenes
│   │   ├── customers/   # Módulo de clientes
│   │   ├── products/    # Módulo de productos
│   │   ├── sales/       # Módulo de ventas
│   │   └── prisma/      # Servicio de base de datos
│   └── prisma/
│       ├── schema.prisma
│       ├── seed.ts      # Datos iniciales
│       └── seed-data.ts # Dataset de ejemplo
│
└── panelsyrox/          # Frontend Next.js
    ├── app/
    │   ├── login/       # Página de autenticación
    │   └── admin/       # Panel principal (protegido)
    │       ├── page.tsx         # Dashboard
    │       ├── products/        # Gestión de productos
    │       ├── categories/      # Gestión de categorías
    │       └── sales/           # Gestión de ventas
    ├── components/
    │   ├── products/    # Tabla y modal de productos
    │   ├── categories/  # Tabla y modal de categorías
    │   └── sales/       # Tabla y modal de ventas
    ├── interfaces/      # Tipos TypeScript
    ├── hooks/           # Custom hooks
    └── lib/             # Utilidades (auth, validaciones)
```

---

## ✨ Funcionalidades

### 🔐 Autenticación
- Login con email y contraseña
- Validación client-side y server-side
- Token JWT almacenado en cookies
- Rutas protegidas con guard en el backend

### 📊 Dashboard
- Métricas en tiempo real (ventas, productos, clientes)
- Listado de ventas recientes
- Top productos por ventas
- Navegación rápida a cada módulo

### 📦 Productos
- CRUD completo con modal
- Subida de imágenes a Cloudinary
- Selector de categoría con jerarquía (padre/hijos)
- Búsqueda de marca con autocomplete
- Opciones de producto (Color, Material)
- Filtro por estado (Activo/Inactivo)
- Paginación con slider

### 🗂️ Categorías
- CRUD completo
- Soporte de categorías padre/hijo (árbol de categorías)
- Vista de detalle con subcategorías listadas
- Modal de creación y edición

### 🏷️ Marcas
- CRUD completo
- Asociación con productos
- Validación: no se puede eliminar una marca con productos asociados

### 🧾 Ventas
- Listado con búsqueda por cliente o número de orden
- Estados: `PENDING` → `PREPARING` → `SHIPPED` → `COMPLETED` / `CANCELLED`
- Modal de gestión con historial de modificaciones
- Código de tracking para envíos
- Información de pago y envío

### 👥 Clientes
- Registro automático al crear ventas
- Datos: nombre, email, teléfono

---

## ⚙️ Instalación y configuración

### Requisitos previos
- Node.js 18+
- PostgreSQL 14+
- Cuenta en Cloudinary

---

### Backend — `adminsyrox`

```bash
cd adminsyrox
npm install
```

Creá el archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/syrox_db"
JWT_SECRET="tu_jwt_secret_seguro"
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

Ejecutá las migraciones y el seed:

```bash
npx prisma migrate dev
npx prisma generate
npx ts-node prisma/seed.ts
```

Iniciá el servidor:

```bash
npm run start:dev
# Servidor en http://localhost:5000
```

---

### Frontend — `panelsyrox`

```bash
cd panelsyrox
npm install
```

Creá el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Iniciá el servidor:

```bash
npm run dev
# Aplicación en http://localhost:3000
```

---

## 🌱 Datos de prueba

El seed incluye datos realistas para comenzar:

| Entidad | Cantidad |
|---|---|
| Categorías | 8 principales + 33 subcategorías |
| Marcas | 22 |
| Productos | 32 |
| Clientes | 8 |
| Ventas | 10 (con distintos estados) |

**Credenciales de acceso:**
```
Email:    admin@syrox.com
Password: admin123
```

---

## 🗄️ Modelo de datos

```
Admin
 └── autenticación del panel

Category
 ├── parent (Category, opcional)
 └── children (Category[])

Brand
 └── products (Product[])

Product
 ├── category (Category)
 ├── brand (Brand)
 └── options (ProductOption[])

Customer
 └── sales (Sale[])

Sale
 ├── customer (Customer)
 ├── items (SaleItem[])
 └── status: PENDING | PREPARING | SHIPPED | COMPLETED | CANCELLED

SaleItem
 ├── sale (Sale)
 └── product (Product)
```

---

## 🎨 Características de UI

- **Dark mode** — soporte completo
- **Diseño responsivo** — adaptado a distintas resoluciones
- **Feedback visual** — estados de carga, errores y éxito
- **Paginación** — con slider y navegación por páginas
- **Búsqueda en tiempo real** — en todas las tablas
- **Modales** — para crear, editar y ver detalles

---

## 📡 Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Autenticación |
| GET/POST/PATCH/DELETE | `/admin/products` | CRUD Productos |
| GET/POST/PATCH/DELETE | `/admin/categories` | CRUD Categorías |
| GET/POST/PATCH/DELETE | `/admin/brands` | CRUD Marcas |
| GET | `/admin/sales` | Listado de ventas |
| PATCH | `/admin/sales/:id/status` | Actualizar estado |
| GET | `/admin/customers` | Listado de clientes |
| GET | `/admin/dashboard` | Métricas del panel |

---

## 👩‍💻 Desarrollado por

**Carolina Ariza** — Prueba técnica Full Stack
