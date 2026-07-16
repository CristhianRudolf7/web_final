# EcoPlataforma para Agricultores y Marketplace

Este proyecto consiste en una plataforma web diseñada específicamente para que los agricultores gestionen de forma eficiente sus tierras de cultivo y, al mismo tiempo, dispongan de un mercado digital (marketplace) que facilite la venta directa de sus productos agrícolas. 

La plataforma adopta una estética orgánica caracterizada por un fondo blanco limpio con detalles en tonalidades verdes.

## Arquitectura y Tecnologías
- **Frontend:** Vite + React + TypeScript + Tailwind CSS (Estilos orgánicos, responsive)
- **Backend:** Django Rest Framework (DRF)
- **Base de Datos:** PostgreSQL con identificación mediante UUIDs
- **Comunicación y Notificaciones:** Integración con la API de Telegram

---

## Tabla de Requerimientos

A continuación se detalla la matriz de requerimientos del sistema, compuesta por **12 requerimientos funcionales (RF)** y **8 requerimientos no funcionales (RNF)**.

### Requerimientos Funcionales (RF)

| ID | Descripción | Prioridad | Módulo | Criterio de Aceptación | Validación Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Catálogo del Marketplace (Landing Page) | Alta | Marketplace (Público) | Al acceder a la página de inicio, se debe desplegar el catálogo de productos con imagen, nombre y precio en un diseño responsive. En dispositivos móviles se presentará un menú hamburguesa de navegación. | Test de renderizado del componente del landing page usando `Vitest` y `React Testing Library`. |
| **RF-02** | Vista de Detalle de Producto | Alta | Marketplace (Público) | Al hacer clic en un producto del catálogo, el usuario será redirigido a `/productos/:id`, donde se mostrarán detalles adicionales y los datos de contacto del agricultor. | Test de integración en el frontend para validar la ruta dinámica `/productos/:id` y prueba automatizada del endpoint `GET /api/productos/<uuid>/` en DRF con `pytest`. |
| **RF-03** | Autenticación mediante DNI y Contraseña | Alta | Autenticación | El usuario iniciará sesión a través de la ruta `/login`. El formulario de inicio de sesión debe heredar el header y footer del landing page. Credenciales correctas redirigirán al Dashboard. | Pruebas de integración del endpoint `POST /api/login/` usando `pytest` en Django. |
| **RF-04** | Panel de Control con Menú Lateral Dinámico | Media | Dashboard (Privado) | Al iniciar sesión, se presentará un menú lateral colapsable. En pantallas de escritorio desplazará el contenido a la derecha, mientras que en pantallas móviles se superpondrá sobre el contenido principal. | Pruebas de componentes React simulando anchos de ventana (`viewport`) y verificando las clases de CSS aplicadas. |
| **RF-05** | CRUD de Productos e Inventario | Alta | Productos (Panel) | El agricultor autenticado podrá crear, listar, actualizar y eliminar sus productos de venta e inventario desde su panel de gestión. | Test automatizados de endpoints HTTP (`POST`, `GET`, `PUT`, `DELETE`) en `/api/productos/` usando `pytest` con autenticación simulada. |
| **RF-06** | Gestión y Exportación de Parcelas | Alta | Parcelas (Panel) | Visualización de parcelas con filtros de búsqueda avanzada. Toda la tabla de información debe poder exportarse inmediatamente a formatos CSV y JSON. | Test unitarios en Django que verifiquen la generación del archivo con cabeceras `text/csv` y `application/json` en los endpoints de descarga. |
| **RF-07** | Detalle Histórico de Parcela por UUID | Media | Parcelas (Panel) | La ruta del detalle histórico debe contener el UUID de la parcela (`/parcelas/:uuid`). Los datos históricos temporales deben ser filtrables e igualmente exportables a CSV y JSON. | Test de validación de formato UUID en el parámetro de la ruta y validación de respuesta JSON estructurada con `pytest`. |
| **RF-08** | Dibujo de Sublotes en Mapa Interactivo | Alta | Mapas (Panel) | El usuario visualizará un plano rectangular en el que podrá registrar puntos para delimitar sus sublotes (similar a etiquetado YOLO). La escala (ancho/largo representados) debe guardarse en la base de datos. | Pruebas de integración en React para simular clics en el plano de coordenadas y envío del JSON de polígonos al backend. |
| **RF-09** | Vistas Especializadas de Mapa (Humedad y Temperatura) | Media | Mapas (Panel) | El mapa interactivo contará con 3 pestañas superiores (Normal, Humedad, Temperatura). En las pestañas de Humedad y Temperatura se mostrará un mapa de calor donde los colores oscuros representarán mayor valor. | Test de componentes en React que evalúe el cambio de estado de la pestaña seleccionada y la correcta asignación de clases de mapa de calor. |
| **RF-10** | Acciones de Sublote (Riego e Ingreso de Datos) | Alta | Mapas (Panel) | Al hacer clic en un sublote, se abrirá un modal con las opciones "Regar" (ingreso de litros) e "Ingresar Datos" (temperatura, humedad, pH). Ambos deben almacenar fecha y hora en formato de zona horaria peruana. | Test automatizado en el backend que envíe registros de riego y valide que se guarden con el timezone `America/Lima` (UTC-5). |
| **RF-11** | Panel de Notificaciones y Recomendaciones | Media | Notificaciones | Un botón en el header del panel desplegará recomendaciones de riego/cultivo y alertas críticas basadas en las lecturas cargadas en los sublotes. | Pruebas unitarias de las funciones de lógica de negocio que determinan el disparo de alertas y recomendaciones según rangos de pH, humedad y temperatura. |
| **RF-12** | Integración con Notificaciones de Telegram | Media | Notificaciones | El sistema disparará y enviará alertas críticas directamente al bot o canal de Telegram enlazado al perfil del agricultor. | Mock de la API de Telegram (`requests-mock` o `responses`) para validar el envío correcto de payloads cuando se generen alertas críticas. |

### Requerimientos No Funcionales (RNF)

| ID | Descripción | Prioridad | Módulo | Criterio de Aceptación | Validación Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RNF-01** | Autenticación Segura con JWT y HttpOnly | Alta | Seguridad / API | La autenticación usará JWT. El token de acceso expirará en 30 minutos y el token de refresco en 7 días. Se deben almacenar en cookies HttpOnly para mitigar ataques XSS. | Pruebas de integración comprobando que la respuesta de login incluya las cabeceras `Set-Cookie` con parámetros `HttpOnly`, `SameSite` y `Secure`. |
| **RNF-02** | Identificación de Registros mediante UUID | Alta | Base de Datos | Todas las llaves primarias en la base de datos de PostgreSQL deben ser identificadores únicos universales (UUID) en lugar de IDs secuenciales. | Inspección de las migraciones de Django (`python manage.py sqlmigrate`) verificando el uso de `models.UUIDField` en todos los modelos. |
| **RNF-03** | Concurrencia de Procesamiento | Alta | Rendimiento | La API backend debe ser capaz de procesar un flujo de hasta 50,000 lecturas de sensores por hora sin bloquear el hilo principal de ejecución. | Prueba de carga concurrente simulando tráfico masivo utilizando herramientas como `k6` o `Locust`. |
| **RNF-04** | Latencia Máxima de Respuesta | Alta | Rendimiento | La latencia media de las peticiones a la API en operaciones de lectura debe ser inferior a 500 milisegundos. | Medición de tiempos de respuesta en entornos de prueba con `k6` y monitoreo del TTFB (Time to First Byte). |
| **RNF-05** | Caché para Consultas de Estado | Media | Rendimiento / Caché | Implementación de una caché rápida para almacenar la última lectura de sensores disponible y evitar consultas constantes a la base de datos PostgreSQL. | Test unitario usando `assertNumQueries` en Django para confirmar que la consulta de la última lectura no genera hits de base de datos tras ser cacheada. |
| **RNF-06** | Límite de Peticiones (Rate Limiting) | Alta | Seguridad / API | Se restringirá el acceso a un máximo de 5 peticiones por segundo por usuario para prevenir ataques de denegación de servicio (DoS). | Test de API enviando ráfagas de 6 peticiones en menos de un segundo y comprobando la respuesta HTTP `429 Too Many Requests`. |
| **RNF-07** | Gestión de Zona Horaria Local (Hora Peruana) | Alta | Core / Servidor | Todo registro temporal de riego, temperatura, humedad y ph debe configurarse y almacenarse utilizando de forma estricta la hora oficial peruana. | Configuración de `TIME_ZONE = 'America/Lima'` en Django `settings.py` y aserciones de zona horaria con `pytz` o `zoneinfo` en tests unitarios. |
| **RNF-08** | Diseño Responsivo y Estilo Orgánico | Media | Frontend (UI) | El frontend debe seguir el diseño del documento de requerimientos (estilo orgánico, fondo blanco, detalles verdes) y adaptarse automáticamente a pantallas móviles, tabletas y desktop usando Tailwind CSS. | Verificación de clases responsivas de Tailwind CSS, validación de diseño adaptable mediante pruebas en frontend con `Lighthouse` (puntuación > 90 en Accesibilidad y Mejores Prácticas). |
