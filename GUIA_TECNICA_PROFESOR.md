Guía Técnica — Fundación Grítalo App

Documento confeccionado para facilitar la comprensión de la arquitectura y el código fuente del proyecto.

---

1. Introducción a React y Next.js

¿Qué es React?

React es una biblioteca de TypeScript (o JavaScript) desarrollada por Meta (Facebook) para construir interfaces de usuario. 

Su idea central es que la UI se divide en componentes reutilizables: piezas independientes que reciben datos y devuelven HTML. (Se dice que sus archivos de presentación son "fábricas" de HTML).


Componente = función que recibe datos → devuelve interfaz (HTML/JSX)


Por ejemplo, un componente "Card" recibe un título y un contenido, y devuelve un rectángulo con esos datos renderizados. 

Cada componente es una función de TypeScript. 

Lo que está dentro de la función "return" es lo que se convierte en HTML visible en el navegador. 

Esa sintaxis se llama JSX (JavaScript XML): parece HTML, pero vive dentro del código TypeScript y permite insertar datos dinámicos con llaves "{ }". Por ejemplo:

  function Saludo({ nombre }) {
    return <h1>Hola, {nombre}</h1>;
  }

Todo lo que está antes del "return" es lógica (obtener datos, calcular valores, validar). Todo lo que está dentro del "return" es presentación (el HTML que ve el usuario). Esa separación se repite en todos los archivos "page.tsx" y componentes del proyecto.

La página del dashboard se construye combinando varios componentes ("Card", "Button", "Sidebar", etc.) como piezas de Lego.


¿Qué es Next.js y por qué se usa?

React por sí solo es una biblioteca de frontend. 

Para tener una aplicación completa (con rutas, backend, autenticación, etc.) se necesita un framework. Next.js es ese framework y aporta:

- Enrutamiento basado en archivos: cada archivo dentro de "src/app/" se convierte
  automáticamente en una ruta de la aplicación. No hay un archivo de configuración de
  rutas — la estructura de carpetas es la configuración.
- Server Components: componentes que se ejecutan en el servidor y pueden acceder
  directamente a la base de datos, sin necesidad de una API HTTP intermedia. 
  Esto coexiste conla API REST ("/api/v1/") que la aplicación también expone para clientes 
  externos (ver sección 4, Flujo C).
- API Routes: capacidad de definir endpoints HTTP (REST) dentro del mismo proyecto,
  sin necesitar un servidor Express o similar aparte.
- Middleware: intercepta las peticiones antes de que lleguen a la página para
  verificar autenticación, redirigir, etc.


Estructura inicial generada por Next.js

Al crear un proyecto de React con el comando en la terminal "npx create-next-app", Next.js genera la siguiente estructura base, que este proyecto extiende:


fundacion-gritalo-app/
├── src/                    ← Todo el código fuente vive aquí
│   ├── app/                ← Páginas y rutas (enrutamiento por carpetas)
│   ├── components/         ← Componentes reutilizables de UI
│   ├── lib/                ← Lógica de negocio, servicios, utilidades
│   ├── auth.ts             ← Configuración de autenticación
│   └── middleware.ts       ← Interceptor de peticiones (protección de rutas)
├── prisma/                 ← Definición del esquema de base de datos (ORM)
├── public/                 ← Archivos estáticos (favicon, manifest)
├── package.json            ← Dependencias y scripts del proyecto
├── tsconfig.json           ← Configuración de TypeScript
└── next.config.ts          ← Configuración de Next.js



Convenciones de nomenclatura de Next.js

Next.js usa nombres de archivo reservados con significado especial:

| Archivo          | Significado                                          |
|------------------|------------------------------------------------------|
| "page.tsx"       | Define una página accesible por URL                  |
| "layout.tsx"     | Envuelve a las páginas hijas (barra lateral, header) |
| "route.ts"       | Define un endpoint de API (no una página visual)     |
| "error.tsx"      | Página de error para esa sección                     |
| "middleware.ts"  | Interceptor que corre antes de cada petición         |

Las carpetas entre paréntesis como "(auth)" o "(dashboard)" son agrupaciones
lógicas que no afectan la URL. Es decir, "src/app/(auth)/login/page.tsx" se
accede como "/login", no como "/auth/login".

---

2. Mapa de arquitectura: dónde encontrar cada capa

La aplicación sigue una arquitectura en tres capas clásica. 
Estas capas se distribuyen en el proyecto de la siguiente manera:


┌─────────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN (UI)                       │
│                                                                     │
│  src/app/(dashboard)/panel/page.tsx   ← Página del dashboard        │
│  src/app/(dashboard)/actividades/     ← Página de actividades       │
│  src/app/(dashboard)/voluntarios/     ← Página de voluntarios       │
│  src/app/(auth)/login/page.tsx        ← Página de inicio de sesión  │
│  src/components/sidebar.tsx           ← Barra lateral               │
│  src/components/ui/                   ← Componentes base (botones…) │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                 CAPA DE LÓGICA DE NEGOCIO                           │
│                                                                     │
│  src/lib/services/activity.service.ts   ← CRUD de actividades       │
│  src/lib/services/volunteer.service.ts  ← CRUD de voluntarios       │
│  src/lib/services/hour-log.service.ts   ← Registro de horas         │
│  src/lib/services/dashboard.service.ts  ← Métricas del dashboard    │
│  src/lib/validations/                   ← Validación de datos (Zod) │
│  src/lib/actions/auth.ts                ← Lógica de login/logout    │
│  src/auth.ts                            ← Configuración de auth     │
│  src/app/api/v1/                        ← Endpoints REST (HTTP)     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                     CAPA DE DATOS                                   │
│                                                                     │
│  src/lib/prisma.ts                      ← Conexión al ORM           │
│  prisma/schema.prisma                   ← Definición de tablas,     │
│                                            relaciones y enums       │
│  Base de datos PostgreSQL (Neon)        ← Servidor remoto           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘



Resumen rápido para localizar código

| Si busca…                         | Mire en…                             |
|-----------------------------------|--------------------------------------|
| Las pantallas que ve el usuario   | "src/app/" y "src/components/"       |
| Las reglas de negocio y servicios | "src/lib/services/"                  |
| Las validaciones de formularios   | "src/lib/validations/"               |
| Los endpoints HTTP de la API      | "src/app/api/v1/"                    |
| La autenticación                  | "src/auth.ts" y "src/auth.config.ts" |
| El esquema de base de datos       | "prisma/schema.prisma"               |
| La conexión a la base de datos    | "src/lib/prisma.ts"                  |

---


3. Acceso a datos: de Supabase a Neon + Prisma

Arquitectura anterior (Supabase)

En la primera versión del proyecto se utilizó Supabase, una plataforma que ofrece una base de datos PostgreSQL con una API REST autogenerada. 

Supabase expone automáticamente endpoints HTTP para cada tabla: al crear una tabla "users",
Supabase genera los endpoints "GET /users", "POST /users", "PATCH /users/:id", etc. sin necesidad de escribir código backend.

El problema era que no existía un backend propio que pudiera presentarse en un proyecto académico.


Arquitectura actual (Neon + Prisma + Next.js)

Se migró a una arquitectura donde el backend es explícito y controlado:


┌──────────────┐      ┌──────────────────┐      ┌───────────────┐
│   Navegador  │ ───→ │  Next.js Server  │ ───→ │  PostgreSQL   │
│   (React)    │ ←─── │  (Node.js)       │ ←─── │  (Neon Cloud)  │
└──────────────┘      └──────────────────┘      └───────────────┘
     Frontend              Backend                Base de datos


| Componente     | Tecnología    | Función                                          |
|----------------|---------------|--------------------------------------------------|
| Base de datos  | Neon          | PostgreSQL serverless en la nube                 |
| ORM            | Prisma        | Traduce código TypeScript a consultas SQL        |
| Backend        | Next.js       | Ejecuta la lógica de negocio en el servidor      |
| Frontend       | React         | Renderiza la interfaz en el navegador            |



¿Qué es Prisma y por qué se usa?

Prisma es un ORM (Object-Relational Mapping). En lugar de escribir SQL directo, se define el esquema de la base de datos en un archivo declarativo ("prisma/schema.prisma") y se interactúa con la base de datos mediante código TypeScript tipado.

Ejemplo — en lugar de escribir:
sql
SELECT  FROM "Activity" WHERE estado = 'publicada' ORDER BY "fechaInicio" DESC;


Se escribe:
typescript
const actividades = await prisma.activity.findMany({
  where: { estado: "publicada" },
  orderBy: { fechaInicio: "desc" },
});


Prisma genera las consultas SQL de forma segura, previene inyección SQL, y
proporciona autocompletado y verificación de tipos en tiempo de desarrollo.


¿Por qué Neon y no Supabase?

Neon es un servicio de PostgreSQL puro (sin API autogenerada). Esto nos obliga a
escribir nuestro propio backend, lo cual es deseable para el TFG porque:

1. Otorga control total: cada endpoint y cada consulta están escritos explícitamente.
2. Permite trazabilidad: se puede seguir el flujo de datos desde el botón hasta la base
   de datos línea por línea en el código.
3. Validación propia: los datos se validan con Zod antes de tocar la base de datos.
4. Arquitectura demostrable: hay una separación clara entre presentación,
   lógica de negocio y acceso a datos.

---


4. Flujo de datos: del navegador a la base de datos y de vuelta


Flujo A: Carga de una página (Server Component)

Este es el flujo principal del dashboard. La página se renderiza en el servidor
y llega al navegador ya con los datos.


                           SERVIDOR
                    ┌──────────────────────────────────────┐
                    │                                      │
 1. Petición GET    │  2. middleware.ts                    │
 ─────────────────→ │     Verifica autenticación           │
 navegador pide     │            │                         │
 /panel             │            ▼                         │
                    │  3. (dashboard)/layout.tsx           │
                    │     Verifica sesión y rol            │
                    │     Renderiza Sidebar                │
                    │            │                         │
                    │            ▼                         │
                    │  4. panel/page.tsx                   │
                    │     Llama a DashboardService         │
                    │            │                         │
                    │            ▼                         │
                    │  5. dashboard.service.ts             │
                    │     Ejecuta queries con Prisma       │
                    │            │                         │
                    │            ▼                         │
                    │  6. prisma.ts → PostgreSQL (Neon)    │
                    │     Consulta SQL a la base de datos  │
                    │            │                         │
                    │            ▼                         │
                    │  7. Los datos suben de vuelta:       │
                    │     BD → Prisma → Service → Page     │
                    │     La página se renderiza con       │
                    │     los datos reales                 │
                    └────────────────┬─────────────────────┘
                                     │
 8. HTML completo   ←────────────────┘
 el navegador recibe
 la página ya renderizada


Archivos involucrados en este flujo (en orden):

| Paso | Archivo                               | Qué hace                              |
|------|-----------------------------------------|------------------------------------------|
| 1    | (el navegador)                          | Solicita la URL "/panel"                 |
| 2    | "src/middleware.ts"                     | Verifica que el usuario esté logueado    |
| 3    | "src/app/(dashboard)/layout.tsx"        | Verifica rol admin, renderiza sidebar    |
| 4    | "src/app/(dashboard)/panel/page.tsx"    | Llama a los servicios para obtener datos |
| 5    | "src/lib/services/dashboard.service.ts" | Ejecuta las queries a la BD              |
| 6    | "src/lib/prisma.ts"                     | Envía SQL a PostgreSQL vía Prisma        |
| 7    | (retorno)                               | Los datos suben por la misma cadena      |
| 8    | (el navegador)                          | Recibe HTML con los datos incrustados    |


Flujo B: Inicio de sesión (Client Component + Server Action)

La página de login se ejecuta en el navegador (necesita interactividad: formulario, estados de carga, errores). Al enviar el formulario, invoca una Server Action que se ejecuta en el servidor.


         NAVEGADOR                              SERVIDOR
  ┌─────────────────────┐              ┌─────────────────────────┐
  │                     │              │                         │
  │ 1.login/page.tsx    │  2. submit   │ 3. actions/auth.ts      │
  │   Formulario con    │ ───────────→ │    loginAction()        │
  │   email + password  │  (Server     │         │               │
  │   (react-hook-form) │   Action)    │         ▼               │
  │                     │              │ 4. auth.ts              │
  │                     │              │    signIn() de NextAuth │
  │                     │              │         │               │
  │                     │              │         ▼               │
  │                     │              │ 5. Prisma → PostgreSQL  │
  │                     │              │    Busca usuario por    │
  │                     │              │    email, compara hash  │
  │                     │              │    de contraseña        │
  │                     │              │         │               │
  │ 7. Redirige a       │  6. Cookie   │         ▼               │
  │   /panel            │ ←─────────── │ 6. Crea sesión JWT      │
  │                     │  de sesión   │    en cookie segura     │
  └─────────────────────┘              └─────────────────────────┘



Flujo C: API REST (para clientes externos)

Los endpoints en "/api/v1/" reciben peticiones HTTP estándar. Este flujo es el que
usaría una aplicación móvil o una herramienta como Postman.


  CLIENTE EXTERNO                         SERVIDOR
  ┌──────────────┐                ┌──────────────────────────┐
  │              │  HTTP Request  │                          │
  │  Postman /   │ ─────────────→ │ 1. api/v1/actividades/   │
  │  App móvil   │  GET /api/v1/  │    route.ts              │
  │              │  actividades   │         │                │
  │              │                │         ▼                │
  │              │                │ 2. api-utils.ts          │
  │              │                │    Verifica sesión       │
  │              │                │         │                │
  │              │                │         ▼                │
  │              │                │ 3. activity.service.ts   │
  │              │                │    Lógica de negocio     │
  │              │                │         │                │
  │              │                │         ▼                │
  │              │  JSON Response │ 4. Prisma → PostgreSQL   │
  │              │ ←───────────── │    Consulta y retorna    │
  └──────────────┘                └──────────────────────────┘


Respuesta típica de la API:
json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "nombre": "Reforestación Cerro Alto",
      "tipo": "ambiente",
      "estado": "publicada",
      "fechaInicio": "2026-03-15T09:00:00.000Z"
    }
  ]
}


---

Resumen

| Aspecto               | Detalle                                                |
|-----------------------|--------------------------------------------------------|
| Framework             | Next.js 16 (React 19 + Node.js)                        |
| Lenguaje              | TypeScript                                             |
| Base de datos         | PostgreSQL (Neon, serverless)                          |
| ORM                   | Prisma                                                 |
| Autenticación         | NextAuth.js v5 (sesiones JWT con cookies)              |
| Validación            | Zod (esquemas declarativos)                            |
| Estilos               | Tailwind CSS                                           |
| Patrón                | Arquitectura en 3 capas (presentación, negocio, datos) |
| API REST              | Disponible en "/api/v1/" para clientes externos        |
