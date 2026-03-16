# Herramientas, tecnologías y técnicas utilizadas

A continuación se describen las herramientas, lenguajes, plataformas y bibliotecas
empleadas en el desarrollo de la aplicación web de la Fundación Grítalo. Para cada
una se incluye una definición, su función dentro del proyecto y la justificación de
su elección.

---

## Lenguajes de programación

### TypeScript

TypeScript es un superconjunto de JavaScript desarrollado por Microsoft que añade
**tipado estático** al lenguaje. Esto significa que el programador declara
explícitamente el tipo de cada variable, parámetro y retorno de función (por ejemplo:
texto, número, lista, objeto), y el compilador verifica que se usen correctamente
antes de ejecutar el código.

**Función en el proyecto:** TypeScript es el lenguaje principal de toda la aplicación,
tanto del frontend (interfaces de usuario) como del backend (lógica de negocio,
acceso a datos, endpoints de la API).

**Justificación:** Se eligió TypeScript sobre JavaScript puro porque la verificación
de tipos en tiempo de desarrollo previene errores comunes (como pasar un texto donde
se espera un número), facilita el mantenimiento del código a medida que crece, y
proporciona autocompletado inteligente en el editor, lo que acelera el desarrollo.

### SQL

SQL (Structured Query Language) es el lenguaje estándar para interactuar con bases
de datos relacionales. Permite crear tablas, insertar registros, consultarlos,
actualizarlos y eliminarlos.

**Función en el proyecto:** SQL es el lenguaje que se ejecuta internamente en la base
de datos PostgreSQL. En la práctica, el desarrollador no escribe SQL directamente,
sino que el ORM Prisma (descrito más adelante) lo genera automáticamente a partir de
código TypeScript.

---

## Framework principal

### Next.js (versión 16)

Next.js es un **framework fullstack** de código abierto basado en React, desarrollado
por Vercel. Un framework es un conjunto de herramientas y convenciones que
proporcionan una estructura predefinida para construir aplicaciones. Next.js extiende
React con capacidades de servidor, enrutamiento, optimización y despliegue.

**Función en el proyecto:** Next.js es la columna vertebral de la aplicación. Cumple
tres roles simultáneamente:

1. **Servidor web:** recibe las peticiones del navegador, ejecuta la lógica del
   backend y devuelve las páginas renderizadas.
2. **Framework de frontend:** organiza los componentes de React en páginas y layouts
   mediante un sistema de enrutamiento basado en la estructura de carpetas.
3. **Servidor de API:** expone endpoints REST en la ruta `/api/v1/` que pueden ser
   consumidos por clientes externos (aplicaciones móviles, herramientas de prueba).

**Justificación:** Se eligió Next.js porque permite desarrollar frontend y backend
en un solo proyecto y un solo lenguaje (TypeScript), elimina la necesidad de
configurar y desplegar dos aplicaciones separadas, y es el framework más adoptado
del ecosistema React con amplia documentación y comunidad activa.

---

## Bibliotecas de frontend

### React (versión 19)

React es una **biblioteca de JavaScript** desarrollada por Meta (Facebook) para
construir interfaces de usuario. Su modelo se basa en **componentes**: funciones
independientes que reciben datos de entrada y devuelven fragmentos de interfaz
(HTML). La interfaz completa se construye componiendo estos componentes como piezas
modulares.

**Función en el proyecto:** React es la herramienta con la que se construyen todas
las pantallas visibles de la aplicación: el formulario de inicio de sesión, el
panel de control (dashboard), las listas de voluntarios y actividades, los
formularios de creación y edición, y la barra lateral de navegación.

**Justificación:** React es la biblioteca de interfaces de usuario más utilizada en
la industria, con un ecosistema de herramientas complementarias muy extenso. Su
modelo de componentes facilita la reutilización de código y la organización de
interfaces complejas.

### Tailwind CSS (versión 4)

Tailwind CSS es un **framework de estilos** que proporciona clases CSS predefinidas
de bajo nivel (por ejemplo: `text-center`, `bg-blue-500`, `rounded-lg`). En lugar
de escribir hojas de estilo separadas, los estilos se aplican directamente en el
HTML mediante estas clases utilitarias.

**Función en el proyecto:** Tailwind se utiliza para diseñar toda la interfaz visual
de la aplicación: colores, tipografía, espaciado, bordes, sombras, diseño
responsivo (adaptación a diferentes tamaños de pantalla) y animaciones.

**Justificación:** Tailwind permite iterar rápidamente sobre el diseño sin salir del
archivo del componente, genera automáticamente solo el CSS que se usa (archivo final
más pequeño), y produce un diseño consistente gracias a su sistema de tokens de
diseño predefinidos.

### Lucide React

Lucide es una biblioteca de **iconos** de código abierto con más de 1 500 iconos en
formato SVG (gráficos vectoriales escalables), disponibles como componentes de React.

**Función en el proyecto:** Proporciona los iconos de la interfaz: iconos de
navegación en la barra lateral, iconos de acciones en botones, iconos indicadores en
las tarjetas del dashboard (usuarios, calendario, reloj) y mensajes de error o
estado.

### React Hook Form + Zod

React Hook Form es una biblioteca para gestionar **formularios** en React de manera
eficiente. Zod es una biblioteca de **validación de datos** que permite definir
esquemas declarativos (reglas que los datos deben cumplir).

**Función en el proyecto:** React Hook Form gestiona el estado de los formularios
(inicio de sesión, creación de actividades, registro de horas) y maneja los errores
de validación. Zod define las reglas de validación (por ejemplo: "el email debe ser
válido", "la contraseña debe tener al menos 6 caracteres", "los cupos deben ser un
número positivo"). Ambas herramientas se integran para validar los datos antes de
enviarlos al servidor.

**Justificación:** La combinación de React Hook Form con Zod permite validar los
datos tanto en el frontend (retroalimentación inmediata al usuario) como en el
backend (seguridad), reutilizando las mismas reglas de validación.

### Recharts (previsto)

Recharts es una biblioteca de **gráficos estadísticos** para React, basada en D3.js.
Permite generar gráficos de barras, líneas, áreas, circulares, entre otros.

**Función en el proyecto:** Está prevista para la sección de reportes, donde se
visualizarán métricas como la evolución de horas de voluntariado, la distribución
de actividades por tipo y la participación mensual. Su implementación está pendiente.

---

## Base de datos y acceso a datos

### PostgreSQL

PostgreSQL es un **sistema de gestión de bases de datos relacional** (RDBMS) de
código abierto. Es una de las bases de datos más robustas y utilizadas en la
industria, con soporte para tipos de datos avanzados, relaciones complejas,
transacciones ACID y extensiones.

**Función en el proyecto:** PostgreSQL almacena toda la información persistente de la
aplicación: usuarios, actividades, inscripciones de voluntarios, registros de horas,
notificaciones, insignias y sesiones de autenticación.

**Justificación:** PostgreSQL fue elegido por su robustez, su compatibilidad con el
ORM Prisma, y su capacidad para manejar relaciones complejas entre entidades
(usuarios inscritos en actividades, horas vinculadas a actividades y validadas por
administradores).

### Neon

Neon es una plataforma que ofrece **PostgreSQL como servicio en la nube** (modelo
serverless). A diferencia de un servidor de base de datos tradicional que debe estar
encendido permanentemente, Neon escala automáticamente según la demanda y se suspende
cuando no hay actividad, lo que reduce costos.

**Función en el proyecto:** Neon hospeda la base de datos PostgreSQL del proyecto. El
servidor Next.js se conecta a Neon mediante una URL de conexión segura (con cifrado
SSL) para leer y escribir datos.

**Justificación:** Neon se eligió como reemplazo de Supabase (utilizado en una
iteración anterior del proyecto). Mientras que Supabase genera una API REST automática
sobre la base de datos (lo que oculta el backend), Neon proporciona únicamente la
base de datos PostgreSQL, lo cual obliga a construir un backend explícito con
endpoints y lógica de negocio propios. Este enfoque es más apropiado para un contexto
académico porque permite demostrar la arquitectura completa del sistema.

### Prisma (versión 6)

Prisma es un **ORM** (Object-Relational Mapping), es decir, una herramienta que
permite interactuar con la base de datos relacional mediante código TypeScript en
lugar de escribir sentencias SQL directamente. El desarrollador define el esquema de
la base de datos en un archivo declarativo (`prisma/schema.prisma`) y Prisma genera
automáticamente un cliente tipado con métodos para crear, leer, actualizar y eliminar
registros.

**Función en el proyecto:** Prisma cumple dos funciones:

1. **Definición del esquema:** el archivo `prisma/schema.prisma` define todas las
   tablas (modelos), sus columnas, tipos de datos, relaciones entre tablas y
   enumeraciones (valores permitidos como roles de usuario o estados de actividad).
2. **Acceso a datos:** los servicios de la aplicación (`activity.service.ts`,
   `volunteer.service.ts`, etc.) utilizan el cliente de Prisma para ejecutar consultas
   a la base de datos de forma segura y tipada.

**Justificación:** Prisma se eligió porque previene errores de SQL mediante el tipado
(el compilador detecta columnas o tablas inexistentes antes de ejecutar), previene
inyección SQL, genera automáticamente las migraciones de base de datos, y proporciona
una interfaz visual (Prisma Studio) para inspeccionar los datos durante el
desarrollo.

---

## Autenticación y seguridad

### NextAuth.js (versión 5)

NextAuth.js es una biblioteca de **autenticación** diseñada específicamente para
Next.js. Gestiona el ciclo completo de autenticación: inicio de sesión, cierre de
sesión, gestión de sesiones y protección de rutas.

**Función en el proyecto:** NextAuth.js maneja todo el flujo de autenticación:

- Verifica las credenciales del usuario (email y contraseña) contra la base de datos.
- Crea una sesión segura mediante un token JWT (JSON Web Token) almacenado en una
  cookie cifrada del navegador.
- Protege las rutas del dashboard para que solo usuarios autenticados con rol de
  administrador puedan acceder.
- Proporciona la información del usuario autenticado (nombre, rol, estado) a todas
  las páginas y componentes que lo necesiten.

**Justificación:** NextAuth.js se eligió por su integración nativa con Next.js y
Prisma, su soporte para múltiples proveedores de autenticación (credenciales, Google,
GitHub, etc.) y porque abstrae las complejidades de seguridad (cifrado de tokens,
rotación de sesiones, protección CSRF).

### bcrypt.js

bcrypt es un **algoritmo de hashing** diseñado específicamente para contraseñas. Un
hash es una transformación irreversible: convierte la contraseña en una cadena de
caracteres aparentemente aleatoria que no puede revertirse para obtener la contraseña
original.

**Función en el proyecto:** Cuando un usuario se registra, su contraseña se procesa
con bcrypt antes de almacenarse en la base de datos. Al iniciar sesión, bcrypt
compara la contraseña ingresada con el hash almacenado para verificar si coinciden,
sin necesidad de almacenar la contraseña en texto plano.

**Justificación:** bcrypt es el estándar de la industria para el almacenamiento
seguro de contraseñas. Incorpora un mecanismo de "sal" (salt) que protege contra
ataques de diccionario y tablas rainbow, y un factor de costo ajustable que lo hace
resistente a ataques de fuerza bruta.

---

## Herramientas de desarrollo

### Node.js

Node.js es un **entorno de ejecución de JavaScript** fuera del navegador, basado en
el motor V8 de Google Chrome. Permite ejecutar JavaScript (y por extensión,
TypeScript) en el servidor, lo que posibilita el desarrollo de aplicaciones backend
con el mismo lenguaje que se usa en el frontend.

**Función en el proyecto:** Node.js es el entorno sobre el cual corre el servidor de
Next.js. Cuando se ejecuta el comando `npm run dev` (desarrollo) o `npm run build`
(producción), Node.js es el proceso que ejecuta el código del backend, renderiza las
páginas, y atiende las peticiones HTTP.

### npm (Node Package Manager)

npm es el **gestor de paquetes** de Node.js. Permite instalar, actualizar y
administrar las dependencias (bibliotecas externas) de un proyecto mediante un
archivo de configuración (`package.json`).

**Función en el proyecto:** npm gestiona todas las dependencias del proyecto
(React, Next.js, Prisma, Tailwind, etc.) y proporciona los scripts de ejecución
(`npm run dev` para desarrollo, `npm run build` para producción, `npm run lint` para
análisis de código).

### ESLint

ESLint es una herramienta de **análisis estático de código** (linter) que examina el
código fuente en busca de errores, malas prácticas y violaciones de estilo sin
necesidad de ejecutarlo.

**Función en el proyecto:** ESLint analiza todo el código TypeScript y JSX del
proyecto, detectando errores potenciales (variables no utilizadas, importaciones
faltantes), problemas de accesibilidad web, y violaciones de las convenciones de
Next.js y React.

### Git y GitHub

Git es un **sistema de control de versiones** distribuido que registra cada cambio
realizado en el código fuente a lo largo del tiempo. Permite volver a versiones
anteriores, trabajar en ramas paralelas, y colaborar entre múltiples desarrolladores
sin conflictos.

GitHub es una **plataforma web** que hospeda repositorios Git en la nube. Además del
almacenamiento de código, ofrece herramientas de colaboración como revisión de
código (pull requests), seguimiento de incidencias (issues) y automatización de
flujos de trabajo.

**Función en el proyecto:** Git se utiliza para el control de versiones del código
fuente, permitiendo rastrear cada modificación y revertir cambios si es necesario.
GitHub hospeda el repositorio remoto del proyecto, sirve como respaldo en la nube y
como medio para compartir el código con el tutor.

### Cursor (IDE)

Cursor es un **entorno de desarrollo integrado** (IDE) basado en Visual Studio Code
que incorpora capacidades de inteligencia artificial para asistir en la escritura,
depuración y comprensión de código.

**Función en el proyecto:** Cursor es el editor de código utilizado durante todo el
desarrollo. Proporciona resaltado de sintaxis, autocompletado inteligente,
integración con Git, terminal integrada, y herramientas de depuración.

---

## Exportación y reportes (previstos)

### jsPDF y jspdf-autotable

jsPDF es una biblioteca para generar **documentos PDF** desde el navegador. El
complemento jspdf-autotable extiende jsPDF con la capacidad de generar tablas
formateadas automáticamente.

**Función en el proyecto:** Están previstas para la generación de reportes
descargables (listados de voluntarios, resúmenes de horas, certificados de
participación). Su implementación está pendiente.

### SheetJS (xlsx)

SheetJS es una biblioteca para leer y escribir archivos de **hojas de cálculo**
(Excel, CSV) desde JavaScript.

**Función en el proyecto:** Está prevista para la exportación de datos a formato
Excel (listados de actividades, registros de horas). Su implementación está
pendiente.

---

## Infraestructura y despliegue

### Vercel (previsto)

Vercel es una **plataforma de despliegue** en la nube optimizada para aplicaciones
Next.js. Proporciona despliegue automático desde GitHub, certificados SSL, red de
distribución de contenido (CDN) y escalado automático.

**Función en el proyecto:** Vercel está prevista como la plataforma de despliegue
para la versión en producción de la aplicación. Cada vez que se envíe código al
repositorio de GitHub, Vercel construirá y publicará automáticamente la nueva
versión.

**Justificación:** Vercel es la plataforma creada por los mismos desarrolladores de
Next.js, lo que garantiza compatibilidad total y configuración mínima. Su capa
gratuita es suficiente para las necesidades del proyecto.

---

## Resumen de tecnologías

| Categoría              | Tecnología         | Versión    | Función principal                          |
|------------------------|--------------------|------------|--------------------------------------------|
| Lenguaje               | TypeScript         | 5.x        | Lenguaje principal (frontend y backend)    |
| Framework              | Next.js            | 16.1.6     | Framework fullstack (servidor + frontend)  |
| UI                     | React              | 19.2.3     | Construcción de interfaces de usuario      |
| Estilos                | Tailwind CSS       | 4.x        | Diseño visual y responsivo                 |
| Base de datos          | PostgreSQL (Neon)  | —          | Almacenamiento persistente de datos        |
| ORM                    | Prisma             | 6.19.2     | Acceso tipado a la base de datos           |
| Autenticación          | NextAuth.js        | 5.x        | Login, sesiones, protección de rutas       |
| Validación             | Zod                | 4.3.6      | Validación de datos en frontend y backend  |
| Formularios            | React Hook Form    | 7.71.2     | Gestión de formularios                     |
| Iconos                 | Lucide React       | 0.576.0    | Iconografía de la interfaz                 |
| Hashing                | bcrypt.js          | 3.0.3      | Cifrado seguro de contraseñas              |
| Linter                 | ESLint             | 9.x        | Análisis estático de código                |
| Control de versiones   | Git + GitHub       | —          | Versionado y hospedaje de código           |
| IDE                    | Cursor             | —          | Entorno de desarrollo                      |
| Entorno de ejecución   | Node.js            | 20.x       | Ejecución del servidor                     |
| Gestor de paquetes     | npm                | —          | Gestión de dependencias                    |
