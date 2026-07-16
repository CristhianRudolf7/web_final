# Backlog Detallado de Desarrollo - EcoPlataforma para Agricultores y Marketplace

Este documento contiene el plan de trabajo estructurado en **6 Sprints**. Cada sprint está asignado a un desarrollador del equipo y detalla los checkpoints técnicos necesarios para construir la aplicación utilizando **Vite + React + TypeScript + Tailwind CSS** en el frontend, **Django Rest Framework (DRF)** en el backend y **PostgreSQL** como base de datos.

---

## Sprint 1: Egoavil Huaman Cristhian Rudolf
### Objetivo: Base de Datos, Inicialización del Backend y Autenticación JWT Segura
Este sprint se enfoca en establecer las bases de datos de PostgreSQL dentro del directorio [backend/], configurar Django para trabajar con hora local peruana, crear el esquema de usuarios con UUIDs y desarrollar el flujo de autenticación seguro mediante JWT almacenado en cookies HttpOnly.

#### Configuración del Proyecto y Entorno
- [x] Inicializar el proyecto Django dentro del directorio [backend/] y configurar la base de datos PostgreSQL en `settings.py`.
- [x] Configurar la zona horaria del sistema de Django a la hora oficial peruana: `TIME_ZONE = 'America/Lima'` y `USE_TZ = True`.
- [x] Crear un modelo de usuario personalizado (`User`) que herede de `AbstractUser` utilizando UUIDs como llave primaria (`id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`).
- [x] Crear y ejecutar las migraciones iniciales de la base de datos.
- [x] Configurar e integrar `djangorestframework` y `djangorestframework-simplejwt` en el proyecto.

#### Autenticación y Seguridad
- [x] Implementar el endpoint `POST /api/login/` que reciba DNI y contraseña del usuario.
- [x] Configurar `simplejwt` para emitir dos tokens tras un login exitoso:
  - **Access Token:** Validez de 30 minutos.
  - **Refresh Token:** Validez de 7 días.
- [x] Desarrollar la lógica en el backend para inyectar ambos tokens dentro de cookies HTTP-Only de la respuesta:
  - Las cookies deben tener las banderas `HttpOnly=True`, `Secure=True` (en producción), `SameSite='Lax'` o `'Strict'`.
  - El frontend no debe almacenar ningún token en `localStorage` o `sessionStorage`.
- [x] Crear el endpoint de validación y refresco de tokens `POST /api/token/refresh/` que lea el refresh token desde la cookie HttpOnly para emitir un nuevo access token.
- [x] Implementar el endpoint `POST /api/logout/` que limpie las cookies HttpOnly del navegador del cliente y blackliste el refresh token.
- [x] Desarrollar un decorador o middleware de Rate Limiting personalizado en Django para restringir a un máximo de 5 peticiones por segundo para un mismo usuario (`HTTP 429 Too Many Requests`).

#### Validación y Tests
- [x] Escribir pruebas unitarias con `pytest` en Django para verificar la autenticación correcta con DNI y contraseña.
- [x] Escribir tests de integración para comprobar que las cookies recibidas son estrictamente `HttpOnly`.
- [x] Escribir tests de carga rápidos para asegurar que el límite de 5 peticiones por segundo por usuario bloquee la sexta petición con un estado HTTP 429.

---

## Sprint 2: Coca Huari Mario Maximo
### Objetivo: Inicialización del Frontend, Configuración del Tema Ecológico, Landing Page y Detalle de Productos
Este sprint se enfoca en inicializar la aplicación cliente dentro de la carpeta [frontend/] con Vite, React, TypeScript y Tailwind CSS, configurar el tema visual de fondo blanco y estilo ecológico, e implementar la navegación pública del marketplace y el inicio de sesión.

#### Inicialización del Frontend y Configuración Estructural
- [ ] Inicializar la aplicación utilizando Vite en el directorio [frontend/] con el comando `npm create vite@latest . -- --template react-ts`.
- [ ] Trabajar dentro de [frontend/] e instalar dependencias esenciales de enrutamiento y HTTP: `react-router-dom` y `axios`.
- [ ] Crear la estructura base de directorios del frontend:
  - `/src/components` (para componentes reutilizables como botones, inputs, layout).
  - `/src/pages` (para vistas de página: Landing, Detalle de Producto, Login).
  - `/src/routes` (para configuración de rutas).
  - `/src/types` (para interfaces de TypeScript).
  - `/src/styles` (para configuraciones de CSS global).
- [ ] Instalar Tailwind CSS y generar sus archivos de configuración (`npx tailwindcss init -p`).
- [ ] Configurar el archivo `tailwind.config.js` extendiendo el tema para forzar el **diseño con fondo blanco y estilo ecológico**:
  - Definir la paleta de colores ecológicos:
    - `eco-green-light`: `#E8F5E9` (verde claro para fondos suaves y detalles).
    - `eco-green-primary`: `#2E7D32` (verde esmeralda ecológico para elementos principales y botones).
    - `eco-green-dark`: `#1B5E20` (verde bosque profundo para textos importantes y hovers).
    - `eco-white`: `#FFFFFF` (fondo blanco puro obligatorio).
  - Configurar bordes suaves y orgánicos extendiendo `borderRadius` (ej: `eco-sm: '12px'`, `eco-md: '18px'`, `eco-lg: '24px'`).
- [ ] Importar la tipografía moderna "Outfit" de Google Fonts en `/src/styles/index.css` y configurarla como fuente primaria de la aplicación.
- [ ] Implementar la clase de fondo global en el body de `index.css` para asegurar el fondo blanco limpio de la interfaz.

#### Componentes Comunes y Layout Heredable
- [ ] Diseñar el componente `Header` responsivo y ecológico:
  - Fondo blanco puro con sombra muy sutil (`bg-white shadow-sm border-b border-eco-green-light`).
  - Lógica reactiva para pantallas móviles (mediante un hook `useState` para controlar el estado de apertura/cierre del menú hamburguesa).
  - En mobile, el menú hamburguesa debe deslizarse o abrirse de forma limpia cubriendo las opciones de secciones del landing y botón de login.
- [ ] Diseñar el componente `Footer`:
  - Contenido minimalista que incluya enlaces de contacto, redes del marketplace y colores de acento verdes.
- [ ] Crear el componente `Layout` público utilizando el componente `<Outlet />` de `react-router-dom`:
  - Este layout encapsulará el `Header` y el `Footer`, asegurando que todas las vistas secundarias (landing page, detalle de productos y formulario de inicio de sesión) los hereden automáticamente de forma limpia.

#### Vistas del Marketplace y Routing
- [ ] Implementar la configuración de rutas en `/src/routes/index.tsx` usando `BrowserRouter`, enlazando la raíz `/` a la Landing Page, `/productos/:id` al detalle del producto y `/login` al formulario de inicio de sesión.
- [ ] Crear el archivo `/src/types/index.ts` y definir la interfaz TypeScript para tipar los productos:
  ```typescript
  export interface Producto {
    id: string; // Representado en el backend como UUID
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenUrl: string;
    agricultorNombre: string;
    agricultorContacto: string;
  }
  ```
- [ ] Desarrollar la **Landing Page** (Estilo Marketplace Adidas):
  - Contenedor principal con fondo blanco y espaciado ecológico.
  - Implementar una sección hero minimalista con tipografía grande y tonos verdes ecológicos.
  - Renderizar una grilla responsiva de productos: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`.
  - Crear el componente `ProductoCard` que represente cada producto con su foto (efecto hover de zoom suave `hover:scale-105 transition-all duration-300`), nombre y precio.
- [ ] Desarrollar la vista **Detalle del Producto** en `/src/pages/DetalleProducto.tsx`:
  - Leer el parámetro `:id` (UUID) usando `useParams()`.
  - Maquetar una interfaz de doble columna (desktop): columna izquierda para galería/carrusel de imágenes del producto; columna derecha para información detallada (precio destacado en verde, descripción del cultivo ecológico, stock y tarjeta con la información de contacto y nombre del agricultor).
- [ ] Desarrollar la vista de **Login** en `/src/pages/Login.tsx`:
  - Asegurar la herencia del Header y Footer públicos a través del `Layout`.
  - Diseñar el formulario en una tarjeta centrada con bordes redondeados y fondo blanco.
  - Implementar validaciones tipadas en el DNI (8 caracteres numéricos obligatorios) y contraseña (mínimo 6 caracteres).
  - Controlar el envío del formulario usando estados de carga y error en React, y conectarlo con la API de login en el backend.

---

## Sprint 3: Carbajal Arana Alexander
### Objetivo: CRUD de Productos en Panel del Agricultor y Estructura del Panel Privado
Este sprint consiste en desarrollar los endpoints de gestión de productos privados en el backend de Django, configurar la interfaz del panel de control privado con navegación lateral responsive en React, e integrar el CRUD de productos del agricultor con subida de imágenes y validaciones.

#### Backend del Inventario de Productos
- [ ] Diseñar y crear el modelo `Producto` en la app `productos` de Django:
  - `id`: `models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
  - `nombre`: `models.CharField(max_length=255)`.
  - `descripcion`: `models.TextField()`.
  - `precio`: `models.DecimalField(max_digits=10, decimal_places=2)`.
  - `stock`: `models.IntegerField()`.
  - `imagen`: `models.ImageField(upload_to='productos/', null=True, blank=True)`.
  - `agricultor`: `models.ForeignKey(User, on_delete=models.CASCADE, related_name='productos')`.
  - `fecha_creacion`: `models.DateTimeField(auto_now_add=True)` (asegurar el guardado con la zona horaria de Perú).
- [ ] Crear el serializador `ProductoSerializer` en `productos/serializers.py`:
  - Implementar validaciones para evitar precios negativos (`precio > 0`) o stock menor a cero (`stock >= 0`).
  - Incluir campos de lectura/escritura de imágenes de forma segura.
- [ ] Crear la vista `ProductoViewSet` en `productos/views.py` heredando de `viewsets.ModelViewSet`:
  - Proteger la vista con `permission_classes = [permissions.IsAuthenticated]`.
  - Sobrescribir el método `get_queryset(self)` para retornar únicamente los productos asociados al agricultor autenticado (`self.request.user`).
  - Sobrescribir el método `perform_create(self, serializer)` para asignar automáticamente al agricultor logueado (`serializer.save(agricultor=self.request.user)`).
- [ ] Escribir tests de integración con `pytest` que comprueben:
  - Creación de producto con imagen mockeada.
  - Edición y borrado exitoso por parte del propietario del producto.
  - Bloqueo en caso de que otro usuario intente editar o borrar un producto que no es suyo (`HTTP 403 Forbidden`).

#### Estructura del Panel Privado (Dashboard Layout)
- [ ] Crear el componente `DashboardLayout.tsx` en `/src/components/layout/`:
  - Configurar una estructura grid o flexbox que incluya el Header privado en la parte superior y una sección principal que contenga al Sidebar y al contenido dinámico.
- [ ] Crear el componente `SidebarPrivado.tsx`:
  - En desktop: Fijo a la izquierda con ancho predeterminado (`w-64`), fondo blanco y bordes verdes ligeros (`bg-white border-r border-eco-green-light`). Debe desplazar el contenido del panel hacia la derecha de manera fluida.
  - En mobile: Oculto por defecto. Al activarse por el botón del header, debe comportarse como un cajón deslizable (drawer) que se superpone sobre la interfaz principal con un fondo oscuro translúcido (`bg-black/50`).
  - Estilos de enlaces: Utilizar `<NavLink>` de `react-router-dom` aplicando clases dinámicas de Tailwind CSS (cuando esté activo, usar texto verde `text-eco-green-primary` y fondo suave `bg-eco-green-light`).
  - Enlaces del menú: Dashboard, Productos, Mis Parcelas, Datos de Parcelas, Perfil, Cerrar Sesión.
- [ ] Desarrollar la página de **Perfil** (`Perfil.tsx`):
  - Formulario de sólo lectura que muestre el DNI e información de contacto del agricultor.
  - Habilitar modo edición para actualizar el correo, teléfono y nombre enviando peticiones `PUT` o `PATCH` al endpoint de perfil del backend.

#### Integración del CRUD de Productos en Frontend
- [ ] Crear la página **ProductosPanel.tsx** en `/src/pages/`:
  - Renderizar una tabla responsive (`min-w-full divide-y`) que muestre la lista de productos del agricultor con columnas para: miniatura de imagen, nombre, precio, stock en inventario y acciones (iconos de editar y eliminar).
- [ ] Crear el componente modal `ProductoFormModal.tsx`:
  - Formulario con campos controlados en React (`nombre`, `descripcion`, `precio`, `stock`, `imagen`).
  - Lógica para detectar si se está creando un nuevo producto o editando uno existente (cambiando títulos y botones en consecuencia).
  - Manejo de envío de datos mediante `FormData` para soportar la subida del archivo de imagen (`multipart/form-data`) a través de Axios.
- [ ] Implementar la confirmación y eliminación de productos:
  - Crear un modal de advertencia estilizado en verde y rojo antes de proceder a la eliminación física del producto.
  - Actualizar el estado de la lista de productos en el frontend inmediatamente después de un borrado o edición exitosa.

---

## Sprint 4: Vasco
### Objetivo: Módulo de Gestión de Parcelas, Filtros, Detalle Histórico y Exportación de Datos (CSV/JSON)
Este sprint se enfoca en desarrollar la lógica de base de datos y los endpoints para parcelas y lecturas históricas de sensores, implementar la descarga de reportes estructurados desde el backend en CSV/JSON, y construir la interfaz del panel de parcelas con filtros dinámicos y rutas seguras en React.

#### Modelos y API de Parcelas y Sensores
- [ ] Diseñar y crear el modelo `Parcela` en Django:
  - `id`: `models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
  - `agricultor`: `models.ForeignKey(User, on_delete=models.CASCADE, related_name='parcelas')`.
  - `nombre`: `models.CharField(max_length=255)`.
  - `ubicacion`: `models.CharField(max_length=255)`.
  - `cultivo_actual`: `models.ForeignKey('productos.Producto', on_delete=models.SET_NULL, null=True, blank=True)`.
  - `fecha_creacion`: `models.DateTimeField(auto_now_add=True)`.
- [ ] Diseñar y crear el modelo `LecturaSensor` para almacenar la telemetría histórica:
  - `id`: `models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
  - `parcela`: `models.ForeignKey(Parcela, on_delete=models.CASCADE, related_name='lecturas')`.
  - `temperatura`: `models.DecimalField(max_digits=5, decimal_places=2)`.
  - `humedad`: `models.DecimalField(max_digits=5, decimal_places=2)`.
  - `ph`: `models.DecimalField(max_digits=4, decimal_places=2)`.
  - `fecha_registro`: `models.DateTimeField(auto_now_add=True)`.
- [ ] Configurar el backend para permitir filtros avanzados:
  - Instalar e integrar `django-filter` para proporcionar filtrado sobre `/api/parcelas/` y `/api/parcelas/<uuid>/historico/`.
  - Permitir filtros por rango de fechas en las lecturas (`fecha_registro__gte`, `fecha_registro__lte`).
- [ ] Implementar la exportación de datos en el backend mediante un endpoint dedicado (`GET /api/parcelas/<uuid>/exportar/`):
  - El endpoint debe recibir un parámetro `format` en la query (`?format=csv` o `?format=json`).
  - Para CSV: Utilizar el módulo nativo `csv` de Python, escribir las filas sobre un objeto `HttpResponse` estableciendo el Content-Type a `text/csv` y añadiendo la cabecera `Content-Disposition: attachment; filename="historico_parcela.csv"`.
  - Para JSON: Serializar directamente las lecturas filtradas y retornar un `JsonResponse` estructurado.

#### Interfaz de Gestión de Parcelas en Frontend
- [ ] Crear la página **ParcelasPanel.tsx** en `/src/pages/`:
  - Consumir el endpoint `GET /api/parcelas/` al cargar la vista y mapear los datos a una tabla responsiva con Tailwind CSS.
  - Implementar filtros interactivos en el frontend (búsqueda por nombre de la parcela, selección de cultivo actual y filtrado por rango de fechas).
- [ ] Implementar botones de exportación directa de la lista de parcelas en la tabla:
  - Utilizar una función utilitaria en TypeScript para generar archivos al vuelo: convertir el estado actual en una cadena CSV o en una cadena JSON indentada.
  - Provocar la descarga en el navegador creando un objeto `Blob` y un link temporal `URL.createObjectURL(blob)` para forzar el evento de descarga nativo.
- [ ] En la tabla de parcelas, añadir tres botones de acción por fila:
  - **Ver Detalle:** Utilizar `useNavigate` de `react-router-dom` para redirigir a `/parcelas/:uuid`.
  - **Ver Mapa:** Utilizar `useNavigate` para redirigir a `/parcelas/:uuid/mapa`.
  - **Producto:** Abrir un modal en el que se cargue la lista de productos del agricultor logueado (Sprint 3) y al seleccionar uno, enviar una solicitud `PATCH` a `/api/parcelas/<uuid>/` para actualizar el campo `cultivo_actual`.

#### Vista Detallada de Parcela por UUID
- [ ] Desarrollar la vista **ParcelaDetalle.tsx** en `/src/pages/`:
  - Implementar una validación de formato mediante expresión regular en la carga del componente para confirmar que el parámetro `:uuid` de la URL cumple con la estructura regex estándar de un UUID (`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`). En caso de ser inválido, redirigir al usuario a una vista de error.
  - Consumir el histórico detallado de sensores (`GET /api/parcelas/<uuid>/historico/`).
  - Renderizar los datos en una tabla ordenada cronológicamente (más recientes primero) que incluya: Fecha, Temperatura, Humedad y pH.
  - Integrar filtros de fechas en el cliente para delimitar los registros mostrados e implementar botones para descargar el histórico filtrado consumiendo la API de exportación del backend (`/api/parcelas/<uuid>/exportar/?format=csv`).

---

## Sprint 5: Erick
### Objetivo: Mapa Interactivo, Coordenadas YOLO-like, Calibración de Escalas y Acciones de Sublotes
Este sprint se centra en crear un plano de coordenadas interactivo en React utilizando SVG para el dibujo manual de sublotes (etiquetado tipo YOLO) con almacenamiento de escala dimensional real, y la integración de modales de registro ambiental (riego/sensores) en hora peruana.

#### Modelado de Sublotes y Registros en Backend
- [ ] Diseñar y crear el modelo `Sublote` en la app `parcelas` de Django:
  - `id`: `models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
  - `parcela`: `models.ForeignKey(Parcela, on_delete=models.CASCADE, related_name='sublotes')`.
  - `poligono`: `models.JSONField()` (debe almacenar un array de puntos normalizados `[{ "x": float, "y": float }]` de entre `0.0` y `1.0` relativos a la escala del canvas).
  - `ancho_escala`: `models.DecimalField(max_digits=10, decimal_places=2)` (ancho total real en metros).
  - `largo_escala`: `models.DecimalField(max_digits=10, decimal_places=2)` (largo total real en metros).
  - `fecha_creacion`: `models.DateTimeField(auto_now_add=True)`.
- [ ] Diseñar el modelo `RegistroActividad` para registrar telemetría y riego por sublote:
  - `id`: `models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`.
  - `sublote`: `models.ForeignKey(Sublote, on_delete=models.CASCADE, related_name='actividades')`.
  - `tipo_actividad`: `models.CharField(max_length=20, choices=[('riego', 'Riego'), ('sensores', 'Sensores')])`.
  - `litros_riego`: `models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)`.
  - `temperatura`: `models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)`.
  - `humedad`: `models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)`.
  - `ph`: `models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)`.
  - `fecha_hora`: `models.DateTimeField()` (se debe forzar en el backend a la hora actual de Perú `America/Lima` usando `timezone.now()`).
- [ ] Crear endpoints en DRF para:
  - `/api/parcelas/<uuid>/sublotes/` (`GET` para listar, `POST` para crear).
  - `/api/sublotes/<uuid>/actividades/` (`POST` para registrar actividades de riego/sensores).
  - `/api/sublotes/<uuid>/ultimo-estado/` (`GET` para retornar el último registro de sensores y riego).

#### Interfaz del Mapa Interactivo (Lienzo SVG YOLO-like)
- [ ] Crear el componente **MapaInteractivo.tsx** en `/src/pages/`:
  - Cabecera con pestañas interactivas: **Normal**, **Humedad**, y **Temperatura**.
  - Canvas o contenedor SVG responsivo con fondo blanco y bordes verdes que represente el plano rectangular del terreno.
- [ ] Desarrollar la herramienta de dibujo interactiva:
  - Mantener en estado de React (`puntosDibujo: Array<{x: number, y: number}>`) las coordenadas normalizadas actuales del polígono en creación.
  - Al hacer clic sobre el SVG, capturar las coordenadas del puntero relativas al tamaño actual del contenedor (`x = clickX / canvasWidth`, `y = clickY / canvasHeight`).
  - Renderizar dinámicamente círculos (`<circle>`) en los puntos de anclaje y líneas (`<line>`) conectando los puntos del polígono.
  - Habilitar opción "Cerrar Polígono" que una el último punto con el primero para sellar el sublote y abrir un formulario lateral.
  - Formulario de Calibración: Solicitar obligatoriamente el ancho y largo reales de la escala del eje X y Y del plano (en metros) antes de guardar el sublote en la base de datos.

#### Modales de Acción y Visualización de Calor
- [ ] Desarrollar el modal de opciones de sublote:
  - Al hacer clic sobre un polígono cerrado ya guardado en el mapa, abrir un cuadro emergente flotante con dos formularios:
    - **Formulario "Regar":** Entrada numérica para volumen de riego en litros. Al enviar, hacer POST al backend.
    - **Formulario "Ingresar Datos":** Entradas numéricas para Temperatura, Humedad y pH. Al enviar, hacer POST al backend.
  - Ambos formularios deben realizar la llamada HTTP e inmediatamente refrescar el estado del mapa sin recargar la página.
- [ ] Implementar la visualización del Mapa de Calor dinámico en React:
  - En el tab de **Humedad**, obtener el último porcentaje de humedad registrado de cada sublote. Pintar el fondo del polígono utilizando una función de color RGBA dinámica en base al valor (ej. `rgba(46, 125, 50, ${humedad / 100})`), donde una humedad cercana a 100% se vea verde bosque muy oscuro y 0% transparente.
  - En el tab de **Temperatura**, aplicar una escala de color proporcional al valor térmico registrado (ej. degradado verde claro a verde oliva oscuro según rangos de temperatura).
  - En el tab **Normal**, pintar los polígonos con un borde verde y un fondo semitransparente muy suave.

---

---

## Sprint 6: Rolando
### Objetivo: Dashboard Estadístico, Recomendaciones/Alertas, Integración con Telegram y Rendimiento
Este sprint final integra los datos recolectados en gráficos visuales, añade las notificaciones con recomendaciones automáticas y las conecta con Telegram, además de realizar las optimizaciones de rendimiento y latencia requeridas.

#### Dashboard Estadístico
- [ ] Crear la sección **Dashboard** general en el panel del frontend.
- [ ] Integrar librerías de gráficos en React (como `Recharts` o `Chart.js`) para mostrar visualmente:
  - El histórico de evolución de temperatura, humedad y pH por parcela.
  - Comparativa de volumen de riego (litros) versus el estado de humedad del suelo.
  - Estadísticas generales de los cultivos más productivos.

#### Lógica de Recomendaciones, Alertas y Notificaciones
- [ ] Desarrollar un servicio en el backend de Django que analice las últimas lecturas de los sensores en los sublotes para disparar alertas y recomendaciones:
  - **Alerta ejemplo:** Si la humedad del sublote cae por debajo del 30%, disparar alerta de "Estrés Hídrico".
  - **Recomendación ejemplo:** Si el pH del suelo es superior a 7.5, generar recomendación "Se sugiere fertilizar con componentes acidificantes".
- [ ] Crear el componente en el Header del panel de control para visualizar y marcar como leídas las recomendaciones y alertas generadas.
- [ ] Configurar un sistema de integración con la API de bots de Telegram:
  - Desarrollar un cliente en Python que realice peticiones `POST` al webhook de Telegram.
  - Cuando se registre una alerta crítica en la base de datos, el sistema debe enviar un mensaje de notificación de forma automática al Telegram enlazado al agricultor.

#### Optimización, Caché y Rendimiento
- [ ] Configurar un sistema de caché rápido (Redis o memoria local de Django) para guardar temporalmente la última lectura disponible de los sensores de los sublotes:
  - El endpoint de consulta rápida del último estado no debe realizar consultas SQL repetitivas si los datos se encuentran cacheados.
- [ ] Diseñar el endpoint de entrada masiva de sensores para que soporte la carga de **50,000 lecturas por hora**:
  - Asegurar que no se bloquee el hilo principal de Django utilizando inserciones masivas de base de datos (`bulk_create`) o mediante el uso de colas de tareas asíncronas (Celery con Redis).
- [ ] Medir y garantizar que la latencia de respuesta general de la API de lectura se mantenga por debajo de los 500 ms.
- [ ] Realizar pruebas de rendimiento de carga con `k6` y documentar los resultados de latencia y concurrencia.
