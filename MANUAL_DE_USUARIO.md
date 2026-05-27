# Manual de Usuario — Fundación Grítalo

## Sistema de Gestión de Voluntariado

---

# 1. Introducción

**Fundación Grítalo** es una plataforma web diseñada para la gestión integral del voluntariado. Permite a los administradores coordinar actividades, registrar voluntarios, validar horas de servicio, otorgar insignias de reconocimiento y generar reportes. Los voluntarios, por su parte, pueden inscribirse en actividades, registrar sus horas, consultar su progreso y ver sus insignias obtenidas.

---

# 2. Roles de Usuario

El sistema cuenta con **dos roles**:

| Rol               | Descripción                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Administrador** | Accede al panel de administración (Dashboard) con control total sobre voluntarios, actividades, horas, insignias y reportes. |
| **Voluntario**    | Accede al Portal del Voluntario, donde puede inscribirse en actividades, registrar horas, ver su progreso e insignias.       |

---

# 3. Acceso al Sistema

## 3.1 Inicio de Sesión

1. Acceda a la URL de la aplicación.
2. En la pantalla de inicio de sesión, ingrese su **correo electrónico** y **contraseña**.
3. Haga clic en **"Ingresar"**.

![Pantalla de inicio de sesión]

> **Nota:** Si no tiene una cuenta, contacte a su coordinador regional para que un administrador le registre en el sistema.

## 3.2 Recuperación de Contraseña

1. En la pantalla de inicio de sesión, haga clic en **"¿Olvidó su contraseña?"**.
2. Ingrese su correo electrónico y haga clic en **"Enviar Enlace de Recuperación"**.
3. Recibirá un correo con un enlace válido por **1 hora**.
4. Siga el enlace, elija una nueva contraseña (mínimo 6 caracteres) y confírmela.
5. Haga clic en **"Guardar contraseña"**. Será redirigido al inicio de sesión.

## 3.3 Redirección Post-Inicio de Sesión

Tras iniciar sesión exitosamente, el sistema redirige automáticamente:

- **Administradores** → `/panel` (Dashboard)
- **Voluntarios** → `/portal` (Portal del Voluntario)

---

# 4. Portal del Administrador (Dashboard)

El administrador tiene acceso a las siguientes secciones a través de la barra lateral izquierda:

| Sección           | Descripción                                  |
| ----------------- | -------------------------------------------- |
| **Dashboard**     | Resumen de impacto con indicadores clave     |
| **Voluntarios**   | Gestión completa del equipo de voluntarios   |
| **Actividades**   | Creación y administración de actividades     |
| **Validar horas** | Aprobación o rechazo de registros de horas   |
| **Insignias**     | Catálogo y asignación de insignias           |
| **Reportes**      | Indicadores, gráficos y exportación de datos |

## 4.1 Dashboard (Panel Principal)

Muestra un resumen ejecutivo con:

- **Voluntarios Activos**: Número total de voluntarios con estado activo.
- **Próximas Actividades**: Cantidad de actividades programadas.
- **Horas del Mes**: Total de horas validadas en el mes actual (meta: 500h).
- **Actividades de la Semana**: Tarjetas con las actividades programadas para la semana, mostrando día, hora, tipo y ubicación.

## 4.2 Gestión de Voluntarios

### 4.2.1 Listado de Voluntarios

La tabla de voluntarios muestra:

- Nombre completo y avatar
- Información de contacto (correo y teléfono)
- Cédula
- Fecha de registro
- Estado (Activo / Inactivo / Pendiente)
- Acciones (Editar / Eliminar)

**Filtros disponibles:**

- **Pestañas de estado**: Todos / Activo / Inactivo / Pendiente
- **Búsqueda**: Por nombre, apellido, correo o cédula

### 4.2.2 Registrar un Nuevo Voluntario

1. Haga clic en el botón **"Nuevo Voluntario"**.
2. Complete el formulario con los siguientes campos:
   - **Nombre** y **Apellido** (obligatorios)
   - **Correo electrónico** (obligatorio)
   - **Contraseña** (mínimo 6 caracteres, obligatorio)
   - **Cédula** (opcional)
   - **Teléfono** (opcional)
   - **Habilidades** (separadas por coma, opcional)
   - **URL de imagen** (opcional — sugerencia: usar Postimages.org para obtener un enlace directo)
3. Haga clic en **"Registrar Voluntario"**.

### 4.2.3 Editar un Voluntario

1. Haga clic en el icono de lápiz (✏️) junto al voluntario deseado.
2. Modifique los campos necesarios.
3. Puede cambiar el **estado** del voluntario (Activo / Inactivo / Pendiente).
4. Opcionalmente, puede establecer una **nueva contraseña** (déjela en blanco para mantener la actual).
5. Haga clic en **"Guardar Cambios"**.

### 4.2.4 Eliminar un Voluntario

1. Haga clic en el icono de papelera (🗑️) junto al voluntario.
2. Confirme la eliminación haciendo clic en **"Sí"** o cancélela con **"No"**.

> **Nota:** La eliminación es lógica (soft-delete), el voluntario se marca como eliminado pero sus datos persisten en la base de datos.

### 4.2.5 Ver Detalle de un Voluntario

Haga clic en el nombre del voluntario para ver su página de detalle, que incluye:

- Información personal completa
- **Horas acumuladas validadas**
- **Fecha de registro** en la plataforma
- **Habilidades**
- **Insignias obtenidas** (con icono, nombre, descripción y fecha)
- **Actividades en las que ha participado** (con fechas y estado de inscripción)

## 4.3 Gestión de Actividades

### 4.3.1 Listado de Actividades

La tabla de actividades muestra:

- Nombre (con ubicación si aplica)
- Tipo (Social, Comunitario, Educación, Ambiente, Salud, Comunicación, Logística, Otro)
- Fecha de inicio
- Cupos disponibles / totales
- Estado (Borrador / Publicada / Finalizada / Cancelada)
- Acciones (Inscripciones / Editar / Eliminar)

**Filtros disponibles:**

- **Pestañas de estado**: Todas / Borrador / Publicada / Finalizada / Cancelada
- **Búsqueda**: Por nombre, ubicación o tipo

### 4.3.2 Crear una Nueva Actividad

1. Haga clic en **"Nueva Actividad"**.
2. Complete el formulario:
   - **Nombre** (obligatorio)
   - **Tipo** (seleccione de la lista desplegable)
   - **Descripción** (opcional)
   - **Fecha de inicio** y **Fecha de cierre** (obligatorias)
   - **Cupos totales** (obligatorio, debe ser mayor a 0)
   - **Ubicación** (opcional)
3. Haga clic en **"Crear Actividad"**.

### 4.3.3 Editar una Actividad

1. Haga clic en el icono de lápiz (✏️).
2. Modifique los campos necesarios.
3. En modo edición, también puede cambiar el **estado** de la actividad.
4. Haga clic en **"Guardar Cambios"**.

### 4.3.4 Gestionar Inscripciones

1. Haga clic en el botón **"Inscripciones"** de la actividad deseada.
2. Se abrirá un modal que muestra:
   - **Cupos disponibles / totales** y estado actual
   - **Lista de voluntarios inscritos** con su estado de inscripción
3. **Para inscribir un voluntario:**
   - Seleccione un voluntario del menú desplegable
   - Haga clic en **"Añadir"**
4. **Para retirar un voluntario:**
   - Haga clic en el icono de usuario con signo menos (junto al voluntario)
5. Solo se pueden añadir inscripciones si la actividad está en estado **"Publicada"** o **"Borrador"** y hay cupos disponibles.

### 4.3.5 Eliminar una Actividad

1. Haga clic en el icono de papelera (🗑️).
2. Confirme la eliminación.

### 4.3.6 Ver Detalle de una Actividad

Haga clic en el nombre de la actividad para ver:

- Tipo y estado
- Descripción
- Vigencia (fechas de inicio y cierre)
- Cupos disponibles y totales
- Ubicación
- **Registro de horas**: horas validadas, registros pendientes, validados y rechazados
- Creador de la actividad
- **Lista de voluntarios inscritos** con su información de contacto

## 4.4 Validación de Horas

Esta sección permite al administrador aprobar o rechazar los registros de horas enviados por los voluntarios.

1. En la sección **"Validar horas"**, se muestra una tabla con todos los registros pendientes.
2. Cada fila contiene:
   - **Voluntario** que envió el registro
   - **Actividad** asociada
   - **Fecha** del trabajo realizado
   - **Horas** reportadas
   - **Notas** del voluntario
3. Para cada registro, el administrador puede:
   - ✅ **Validar**: Aprueba las horas, que se suman al total del voluntario.
   - ❌ **Rechazar**: Rechaza el registro (el voluntario puede ver que fue rechazado).

> **Importante:** Solo las horas validadas cuentan para las insignias automáticas y los reportes.

## 4.5 Gestión de Insignias

### 4.5.1 Catálogo de Insignias

El catálogo muestra todas las insignias disponibles. Cada insignia tiene:

- **Icono** (emoji)
- **Nombre**
- **Descripción**
- **Criterio base**: Define cómo se otorga:
  - _Horas_: Por alcanzar cierto número de horas validadas
  - _Actividades_: Por participar en cierto número de actividades distintas
  - _Antigüedad_: Por tiempo en la plataforma
  - _Especial_: Solo por asignación manual del administrador
- **Valor de referencia**: El umbral numérico del criterio

### 4.5.2 Crear una Nueva Insignia

1. Haga clic en **"Agregar insignia"**.
2. Complete el formulario:
   - **Nombre** (único en el catálogo)
   - **Descripción**
   - **Icono** (emoji, ej: 🏆, ⭐, 🎖️)
   - **Criterio base** y **Valor de referencia**
3. Haga clic en **"Crear insignia"**.

### 4.5.3 Editar o Eliminar una Insignia

- **Editar**: Haga clic en el icono de lápiz (✏️) en la tarjeta de la insignia.
- **Eliminar**: Haga clic en el icono de papelera (🗑️) y confirme.

### 4.5.4 Asignar una Insignia a un Voluntario

1. En la sección **"Asignar insignia"**, seleccione:
   - **Voluntario** del menú desplegable
   - **Insignia** del menú desplegable
2. Haga clic en **"Asignar"**.

> **Nota:** Las insignias con criterio "Especial" solo se pueden otorgar manualmente. Las insignias con criterio "Horas", "Actividades" o "Antigüedad" pueden otorgarse automáticamente cuando el voluntario alcanza el umbral definido.

### 4.5.5 Últimas Asignaciones

La tabla de "Últimas asignaciones" muestra las 50 asignaciones más recientes, indicando:

- Voluntario
- Insignia (con icono)
- Fecha de asignación

## 4.6 Reportes

### 4.6.1 Filtros de Búsqueda

En la parte superior de la página de reportes hay una barra de filtros que permite acotar los datos mostrados. Los filtros son **acumulativos** y se reflejan en todos los indicadores, gráficos, tablas y exportaciones.

**Filtro por período:**

- Seleccione un período predefinido del menú desplegable: Hoy, Últimos 7 días, Últimos 30 días, Mes actual, Mes anterior, Trimestre actual, Año actual, Año anterior, Últimos 12 meses, Histórico completo.
- Si necesita un rango personalizado, seleccione **"Personalizado"** y aparecerán dos campos de fecha (Desde / Hasta) para definir el rango exacto.
- La granularidad del gráfico de barras se ajusta automáticamente: **diaria** (hasta 31 días), **mensual** (hasta 24 meses) o **anual** (más de 24 meses).

**Filtro por proyecto:**

- Seleccione un proyecto/actividad específico del menú desplegable para ver solo los datos relacionados con ese proyecto.
- Cada opción muestra el nombre del proyecto, el año y su estado (Borrador, Publicada, Finalizada, Cancelada).
- Seleccione **"Todos los proyectos"** para ver datos sin filtrar por proyecto.

**Filtro por voluntario:**

- Escriba el nombre, apellido o correo de un voluntario en el campo de búsqueda con autocompletado.
- Seleccione el voluntario deseado de la lista desplegable.
- Para quitar el filtro, haga clic en el icono **"X"** dentro del campo o seleccione **"Todos los voluntarios"** en la lista.

**Restablecer filtros:**

- Si hay filtros activos, aparece un botón **"Restablecer"** que limpia todos los filtros y vuelve al año actual.

### 4.6.2 Indicadores Clave (KPIs)

Tres tarjetas muestran los indicadores **según los filtros activos**:

- **Horas validadas (período)**: Total de horas validadas en el rango de fechas seleccionado.
- **Actividades publicadas**: Cantidad de actividades en estado "Publicada" dentro del período.
- **Horas pendientes de validar**: Registros pendientes de aprobación en el período.

### 4.6.3 Gráficos

- **Horas validadas por período**: Gráfico de barras que se adapta automáticamente a la granularidad seleccionada (diaria, mensual o anual). Muestra el total de horas en el período.
- **Actividades por tipo**: Gráfico de pastel con la distribución por tipo de actividad (Social, Educación, Ambiente, Salud, etc.).
- **Voluntarios por estado**: Gráfico de anillo con la distribución de estados (Activo / Inactivo / Pendiente).

### 4.6.4 Top Voluntarios

Tabla con los voluntarios que más horas validadas tienen en el período seleccionado, ordenados de mayor a menor. d

### 4.6.5 Exportación de Datos

Los botones de exportación están en la esquina superior derecha de la página:

- **Excel**: Exporta un archivo `.xlsx` con el detalle completo de todos los registros de horas (fecha, voluntario, email, actividad, horas, estado, notas) **respetando los filtros activos**.
- **PDF resumen**: Genera un archivo `.pdf` con los KPIs, el período seleccionado, el proyecto y voluntario filtrados (si aplica), y el top de voluntarios.

---

# 5. Portal del Voluntario

El voluntario accede a su portal personal después de iniciar sesión. La barra lateral izquierda ofrece las siguientes secciones:

| Sección           | Descripción                              |
| ----------------- | ---------------------------------------- |
| **Inicio**        | Resumen personal con indicadores         |
| **Actividades**   | Actividades disponibles para inscribirse |
| **Mis horas**     | Registro de horas e historial            |
| **Tu progreso**   | Métricas de participación                |
| **Mis insignias** | Insignias obtenidas                      |
| **Mi cuenta**     | Datos del perfil y cambio de contraseña  |

## 5.1 Inicio (Panel Personal)

Muestra un resumen con:

- **Horas validadas (mes)**: Total de horas aprobadas en el mes actual.
- **Registros pendientes**: Horas enviadas que esperan validación del equipo.
- **Insignias**: Número de insignias obtenidas (con enlace para ver detalle).

Además, botones de acceso rápido a:

- Ver actividades
- Registrar horas
- Tu progreso y métricas
- Mis insignias

> **Nota:** Al cargar esta página, el sistema evalúa automáticamente si el voluntario ha alcanzado los umbrales para recibir insignias automáticas.

## 5.2 Actividades Disponibles

Muestra las actividades publicadas en las que el voluntario puede inscribirse.

- Cada tarjeta de actividad muestra: tipo, nombre, fecha, ubicación, descripción y cupos disponibles.
- Si el voluntario ya está inscrito, aparece una etiqueta **"Inscrito"**.
- Si la cuenta está **pendiente de activación**, se muestra un aviso y no se permite la inscripción.
- Para inscribirse, haga clic en **"Inscribirme"**.

## 5.3 Registro de Horas

### 5.3.1 Nuevo Registro

1. Seleccione la **actividad** en la que participó (solo aparecen actividades en las que está inscrito).
2. Seleccione la **fecha** del trabajo realizado.
3. Ingrese las **horas** trabajadas (de 0.5 a 24, con incrementos de 0.5).
4. Opcionalmente, añada **notas** describiendo lo realizado.
5. Haga clic en **"Enviar registro"**.

> **Nota:** Su cuenta debe estar activa para poder enviar registros de horas.

### 5.3.2 Historial de Horas

Muestra una tabla con todos sus registros de horas, indicando:

- Actividad
- Fecha
- Horas
- Estado: **Pendiente** (esperando validación), **Validado** (aprobado) o **Rechazado**

## 5.4 Progreso y Métricas

Esta sección muestra las métricas que el sistema utiliza para otorgar insignias automáticas:

- **Horas validadas (total)**: Suma de todas las horas aprobadas.
- **Actividades distintas**: Número de actividades diferentes en las que ha participado (inscripciones no canceladas).
- **Días en la plataforma**: Tiempo transcurrido desde su fecha de registro.

Además, incluye:

- **Actividades en las que participa**: Tabla con inscripciones activas.
- **Historial de horas validadas**: Detalle de cada bloque de horas aprobado.

> **Nota:** Las insignias automáticas se evalúan cada vez que visita esta página o su inicio.

## 5.5 Insignias y Logros

Muestra todas las insignias que el voluntario ha obtenido, presentadas en tarjetas visuales con:

- Icono representativo
- Categoría (Horas, Actividades, Trayectoria, Reconocimiento especial)
- Nombre de la insignia
- Descripción
- Fecha de obtención
- Detalle del criterio (si aplica)

Si aún no tiene insignias, se muestra un mensaje motivacional invitando a seguir participando.

## 5.6 Mi Cuenta

### 5.6.1 Datos del Perfil

Muestra la información personal del voluntario:

- Nombre completo y avatar
- Estado de la cuenta (Activo / Inactivo / Pendiente)
- Correo electrónico
- Teléfono
- Cédula
- Fecha de ingreso como miembro
- Habilidades

> **Nota:** Para cambiar el correo, teléfono u otros datos personales, contacte a su coordinador.

### 5.6.2 Cambiar Contraseña

1. Ingrese su **contraseña actual**.
2. Ingrese la **nueva contraseña** (mínimo 6 caracteres).
3. Confirme la nueva contraseña.
4. Haga clic en **"Cambiar contraseña"**.

---

# 6. Cierre de Sesión

En cualquier momento, puede cerrar sesión haciendo clic en **"Cerrar Sesión"** en la parte inferior de la barra lateral izquierda.

---

# 7. Consejos y Buenas Prácticas

### Para Administradores:

- **Mantenga actualizados los estados** de los voluntarios (Activo/Inactivo/Pendiente) para controlar quién puede inscribirse en actividades.
- **Valide las horas regularmente** para que los voluntarios vean su progreso actualizado.
- **Use las insignias** como herramienta de motivación y reconocimiento.
- **Revise los reportes** periódicamente para tomar decisiones basadas en datos.

### Para Voluntarios:

- **Inscríbase en actividades** antes de registrar horas, ya que solo puede registrar horas en actividades en las que está inscrito.
- **Registre sus horas** lo antes posible después de cada actividad.
- **Revise su progreso** para saber qué insignias puede estar cerca de obtener.
- **Mantenga su contraseña segura** y cámbiela periódicamente.

---

# 8. Solución de Problemas Comunes

| Problema                            | Posible Solución                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| No puedo iniciar sesión             | Verifique su correo y contraseña. Use "¿Olvidó su contraseña?" para restablecerla.      |
| Mi cuenta está pendiente            | Contacte a un administrador para que active su cuenta.                                  |
| No veo actividades disponibles      | Puede que no haya actividades publicadas aún, o su cuenta no esté activa.               |
| No puedo registrar horas            | Debe estar inscrito en una actividad y tener la cuenta activa.                          |
| No recibo el correo de recuperación | Revise la carpeta de spam. En desarrollo, el enlace aparece en la consola del servidor. |
| No aparecen mis horas validadas     | Espere a que un administrador valide sus registros pendientes.                          |

---

_Documento generado a partir del análisis del código fuente de la aplicación._
_Fundación Grítalo — Sistema de Gestión de Voluntariado_
