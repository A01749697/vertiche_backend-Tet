# Vertiche SortFlow — Backend

Backend REST API para el sistema **Vertiche SortFlow**, una plataforma de clasificación automatizada de prepacks (etiquetas RFID) en un centro de distribución. Gestiona el flujo completo desde la recepción de palets de proveedores hasta el despacho de cajas selladas hacia tiendas destino.

Desarrollado con **Node.js + TypeScript + Sequelize + MySQL (AWS RDS)**, desplegado en **AWS EC2**.

---

## Tabla de contenido

1. [Tecnologías](#tecnologías)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [Base de datos](#base-de-datos)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación y configuración](#instalación-y-configuración)
6. [Variables de entorno](#variables-de-entorno)
7. [Scripts disponibles](#scripts-disponibles)
8. [Endpoints disponibles](#endpoints-disponibles)
9. [Despliegue en EC2](#despliegue-en-ec2)
10. [Convenciones del código](#convenciones-del-código)

---

## Tecnologías

| Tecnología      | Versión   | Uso                              |
|-----------------|-----------|----------------------------------|
| Node.js         | v24+      | Runtime                          |
| TypeScript      | 5.x       | Lenguaje principal               |
| Express         | 4.x       | Framework HTTP                   |
| Sequelize       | 6.x       | ORM para MySQL                   |
| MySQL 8.4       | 8.4.x     | Motor de base de datos (AWS RDS) |
| AWS EC2         | —         | Servidor de aplicación           |
| AWS RDS         | —         | Servidor de base de datos        |
| PM2             | —         | Process manager en producción    |
| dotenv          | —         | Manejo de variables de entorno   |
| cors            | —         | Middleware CORS                  |

---

## Arquitectura del proyecto

```
backend_vertiche/
├── src/
│   ├── index.ts                  # Entry point — registra middlewares y controllers
│   ├── config/
│   │   ├── index.ts              # Exporta PORT y NODE_ENV
│   │   └── config.ts             # Configuración de Sequelize por environment
│   ├── provider/
│   │   └── Server.ts             # Clase Server — inicializa Express, conecta BD
│   ├── models/
│   │   ├── index.ts              # Carga todos los modelos y corre associations
│   │   ├── ProveedorModel.ts
│   │   ├── TiendaModel.ts
│   │   ├── OrdenCompraModel.ts
│   │   ├── DetalleOrdenModel.ts
│   │   ├── PedidoModel.ts
│   │   ├── PaletModel.ts
│   │   ├── PaletEtapaLogModel.ts
│   │   ├── TagModel.ts
│   │   ├── EventoLecturaModel.ts
│   │   ├── CajaModel.ts
│   │   ├── PrepackCajaModel.ts
│   │   ├── InspeccionQAModel.ts
│   │   └── AnomaliaModel.ts
│   └── controllers/
│       ├── AbstractController.ts # Clase base con router y prefix
│       ├── ProveedorController.ts
│       ├── TiendaController.ts
│       ├── OrdenCompraController.ts
│       ├── DetalleOrdenController.ts
│       ├── PedidoController.ts
│       ├── PaletController.ts
│       ├── PaletEtapaLogController.ts
│       ├── TagController.ts
│       ├── EventoLecturaController.ts
│       ├── CajaController.ts
│       ├── PrepackCajaController.ts
│       ├── InspeccionQAController.ts
│       └── AnomaliaController.ts
├── dist/                         # Output compilado de TypeScript (git-ignored)
├── .env                          # Variables de entorno (git-ignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── API_GUIDE.md                  # Documentación completa de endpoints
└── README.md
```

### Patrón de diseño

- **Server:** clase central que inicializa Express, registra middlewares y controllers, y conecta la BD.
- **AbstractController:** clase base abstracta con `router` y `prefix`. Cada controller hereda de ella e implementa `initRoutes()`.
- **Singleton en controllers:** cada controller expone un `static get instance()` para garantizar una sola instancia por proceso.
- **Modelos Sequelize:** patrón `module.exports = (sequelize, DataTypes) => class XModel extends Model`. El `models/index.ts` los carga dinámicamente con `readdirSync` y ejecuta `associate(db)` en cada uno.

---

## Base de datos

**Motor:** MySQL 8.4 en AWS RDS  
**Nombre de BD:** `Vertiche_DB`  
**ORM:** Sequelize con `timestamps: true` y `freezeTableName: true`

### Entidades y relaciones

```
Proveedor ──< OrdenCompra ──< DetalleOrden
Proveedor ──< Pedido ──< Palet ──< PaletEtapaLog
Proveedor ──< Tag
Proveedor ──< Anomalia
Proveedor ──< InspeccionQA
OrdenCompra ──< Palet
Pedido ──< Tag
Palet ──< Tag
Tienda ──< Tag
Tienda ──< Caja ──< PrepackCaja
Tag ──< EventoLectura
Tag ──< PrepackCaja
Tag ──< Anomalia
Tag ──< InspeccionQA
```

### Enums del sistema

| Enum           | Valores                                                                 |
|----------------|-------------------------------------------------------------------------|
| EstadoTienda   | `ACTIVA`, `PAUSADA`, `CERRADA`                                          |
| EstadoOrden    | `CREADA`, `ENVIADA`, `EN_TRANSITO`, `RECIBIDA`, `PARCIAL`, `CANCELADA` |
| EstadoPedido   | `PROGRAMADO`, `EN_TRANSITO`, `LLEGADO`, `PROCESADO`, `INCOMPLETO`      |
| EstadoPalet    | `ESPERANDO`, `EN_RECEPCION`, `EN_QA`, `EN_PACKING`, `COMPLETADO`, `CON_ERROR` |
| TipoFlujo      | `CROSS_DOCK`, `ALMACENAJE`, `DEVOLUCION`                                |
| EstadoPrepack  | `REGISTRADO`, `EN_QA`, `APROBADO`, `RECHAZADO`, `EN_CAJA`, `ENVIADO`  |
| EstadoCaja     | `ABIERTA`, `EN_LLENADO`, `SELLADA`, `ENVIADA`, `ANULADA`               |
| EtapaRFID      | `RECEPCION`, `QA`, `SORTING`, `PACKING`, `SALIDA`                      |
| ResultadoQA    | `APROBADO`, `RECHAZADO`, `RETRABAJO`, `PENDIENTE`                       |
| TipoAnomalia   | `TAG_DESCONOCIDO`, `LECTURA_DUPLICADA`, `BAHIA_INCORRECTA`, `TIENDA_INCORRECTA`, `QA_FALLIDO`, `PALET_INCOMPLETO`, `RSSI_BAJO`, `FUERA_DE_SECUENCIA` |

---

## Requisitos previos

- **Node.js** v18 o superior → [descargar](https://nodejs.org)
- **npm** v9 o superior (viene con Node)
- Acceso al servidor **MySQL/RDS** con una BD creada (`Vertiche_DB`)
- **TypeScript** instalado globalmente (opcional, el proyecto lo instala como devDependency):

```bash
npm install -g typescript
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/A01749697/vertiche_backend-Tet.git
cd vertiche_backend-Tet
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables (ver sección de variables de entorno):

```bash
cp .env.example .env   # si existe el ejemplo
# o créalo manualmente
```

### 4. Compilar TypeScript

```bash
npm run build
```

### 5. Iniciar el servidor

```bash
npm run start
```

El servidor levanta en `http://localhost:<PORT>`. La primera vez que inicia, Sequelize crea automáticamente las tablas en la BD si no existen (`sync({ force: false })`).

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con estas variables:

```env
# Puerto del servidor
PORT=8080

# Entorno (development / production)
NODE_ENV=development

# Base de datos
DB_HOST=<host-rds>.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASS=<tu_password>
DB_NAME=Vertiche_DB
DB_DIALECT=mysql
```

> **Importante:** El archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio. No compartas las credenciales.

---

## Scripts disponibles

| Script            | Comando           | Descripción                                         |
|-------------------|-------------------|-----------------------------------------------------|
| Compilar          | `npm run build`   | Compila TypeScript a JavaScript en `/dist`           |
| Iniciar           | `npm run start`   | Ejecuta el servidor desde `/dist` con dotenv         |
| Build + Start     | `npm run build && npm run start` | Flujo completo de desarrollo    |

---

## Endpoints disponibles

La documentación completa de todos los endpoints, campos requeridos, enums válidos y ejemplos de request/response está en **[API_GUIDE.md](./API_GUIDE.md)**.

### Resumen rápido

Todos los recursos siguen el mismo patrón de rutas:

| Método | Ruta                        | Acción                  |
|--------|-----------------------------|-------------------------|
| GET    | `/<Recurso>/listar<Plural>` | Listar todos            |
| GET    | `/<Recurso>/:id`            | Obtener uno por PK      |
| POST   | `/<Recurso>/crear<Singular>`| Crear nuevo registro    |
| PUT    | `/<Recurso>/:id`            | Actualizar registro     |
| DELETE | `/<Recurso>/:id`            | Eliminar registro       |

### Recursos disponibles

| Recurso        | Prefijo URL       | PK             |
|----------------|-------------------|----------------|
| Proveedor      | `/Proveedor`      | `id` (number)  |
| Tienda         | `/Tienda`         | `tienda_id`    |
| OrdenCompra    | `/OrdenCompra`    | `orden_id`     |
| DetalleOrden   | `/DetalleOrden`   | `id` (number)  |
| Pedido         | `/Pedido`         | `pedido_id`    |
| Palet          | `/Palet`          | `palet_id`     |
| PaletEtapaLog  | `/PaletEtapaLog`  | `id` (number)  |
| Tag            | `/Tag`            | `epc`          |
| EventoLectura  | `/EventoLectura`  | `id` (number)  |
| Caja           | `/Caja`           | `caja_id`      |
| PrepackCaja    | `/PrepackCaja`    | `id` (number)  |
| InspeccionQA   | `/InspeccionQA`   | `id` (number)  |
| Anomalia       | `/Anomalia`       | `id` (number)  |

---

## Despliegue en EC2

### Requisitos en la instancia

- Amazon Linux 2023
- Node.js v18+
- PM2 instalado globalmente

```bash
sudo dnf install -y nodejs
sudo npm install -g pm2
```

### Pasos de despliegue

```bash
# 1. Clonar o actualizar el código
git clone https://github.com/A01749697/vertiche_backend-Tet.git
cd vertiche_backend-Tet

# 2. Configurar variables de entorno
nano .env   # llenar con las credenciales reales

# 3. Instalar dependencias
npm install

# 4. Compilar
npm run build

# 5. Iniciar con PM2
pm2 start dist/index.js --name vertiche-api -- --require dotenv/config

# 6. Configurar inicio automático al reiniciar la EC2
pm2 startup   # copia y pega el comando que imprime
pm2 save
```

### Comandos PM2 del día a día

```bash
pm2 list                      # ver procesos activos
pm2 logs vertiche-api         # ver logs en vivo
pm2 restart vertiche-api      # reiniciar después de un deploy
pm2 stop vertiche-api         # detener
pm2 monit                     # monitor de CPU y RAM
```

### Flujo de actualización (nuevo deploy)

```bash
git pull
npm install
npm run build
pm2 restart vertiche-api
```

### Verificar que el servidor está corriendo

```bash
curl http://localhost:8080/
# Respuesta esperada: Server is working 🚀
```

---

## Convenciones del código

### Modelos

- Nombre de archivo: `<Entidad>Model.ts` en PascalCase
- `modelName` sin sufijo `Model` (ej. `modelName: 'Proveedor'`)
- Enums exportados como `export enum` en el mismo archivo del modelo que los usa primero
- Asociaciones dentro del método `static associate(models: any)`
- Todos los modelos usan `module.exports = (sequelize, DataTypes) => { ... }` para compatibilidad con el loader dinámico de `models/index.ts`

### Controllers

- Patrón Singleton con `private static _instance` y `public static get instance()`
- Heredan de `AbstractController` e implementan `protected initRoutes()`
- Métodos de instancia privados nombrados: `get<Acción>`, `post<Acción>`, `put<Acción>`, `delete<Acción>`
- Todo en `try/catch` con `res.status(500).json(err)` en el catch
- Verificación de existencia con `findByPk` antes de update/delete, responde 404 si no existe

### Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
refactor: refactorización sin cambio de funcionalidad
chore: cambios de configuración o dependencias
```

---

## Equipo

Proyecto académico — Tecnológico de Monterrey  
Materia: TC3005B  
Semestre: 2026

---

> Para la documentación completa de todos los endpoints, campos, enums y ejemplos de consumo desde frontend o agentes IA, consulta [API_GUIDE.md](./API_GUIDE.md).