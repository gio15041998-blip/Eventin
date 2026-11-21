# Eventin · Sistema visual

Identidad creada en Figma el 20 de noviembre de 2026.

## Marca

Eventin conecta a las personas con proveedores para organizar y con eventos para descubrir. Tono cercano, concreto y transparente. Logotipo tipográfico eventin, isotipo e abierto y punto de encuentro. Mantener proporción y protección de media altura del isotipo.

## Color

| Rol | Color |
| --- | --- |
| Acción principal | #145C46 |
| Hover | #0D4535 |
| Texto | #172D28 |
| Texto secundario | #566A63 |
| Fondo | #F6F8F7 |
| Superficie | #FFFFFF |
| Fondo suave | #E7F3ED |
| Acento | #D7EF98 |
| Bordes | #DCE4DF |

Usar texto blanco sobre verde y tinta sobre lima. El color no sustituye etiquetas de estado.

## Tipografía y espacio

Manrope Regular, Medium, SemiBold, Bold y ExtraBold. Escala de referencia: 12/18, 14/20, 16/24, 18/26, 22/30, 28/36, 40/48, 56/64. Algunas portadas usan tamaños específicos.

Espaciado de 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 y 80 px. Controles con radio 12, tarjetas con radio 16. Márgenes de referencia: 24 px móvil y 80 px escritorio. Móvil 390 px y escritorio 1440 px; la implementación debe ser fluida desde 320 px.

## Interacción

Botones con estados default, hover, foco, loading y disabled. Campos con foco y error. Estados de contenido vacío, sin resultados, error de red y carga. Transiciones de 180 ms en el prototipo. Objetivos táctiles de navegación 77 × 72 px; en implementación mantener mínimo de 44 × 44 px y foco visible.

## Archivo y entrega

6 páginas: 00 Marca, 01 Sistema UI, 02 Mobile, 03 Desktop, 04 Administración y 05 Flujos y entrega. Revisión 1.2 del 21 de noviembre de 2026: 66 pantallas móviles, 23 de escritorio para usuarios y 31 administrativas; 8 láminas de marca, 60 componentes, 45 variables y 1014 conexiones de prototipo verificadas.

Revisión visual de Inicio móvil/escritorio, Explorar móvil/escritorio, planificación, portada y color del manual. Auditoría final: cero textos fuera de los límites de su contenedor. Capas editables, instancias reutilizables y fotografías como rellenos independientes.

Esta verificación no sustituye las pruebas de responsive, contraste real, teclado y lector de pantalla de la futura aplicación.

## Revisión 1.1: colaboración y mapa

Navegación móvil: Inicio, Explorar, Mapa, Organizar y Perfil. Favoritos se abre desde la cabecera junto a Notificaciones. Mantener favoritos personales separados de los proveedores propuestos para un evento.

Planificación compartida: pantallas de equipo, invitación, aceptación y estado pendiente. El propietario gestiona accesos; coorganizadores trabajan sobre presupuesto, tareas, proveedores y cotizaciones del evento compartido. Los eventos siguen siendo privados. Las invitaciones reales requieren autenticación, token temporal y revocable, RLS por evento y registro del autor de cambios. La resolución de conflictos de edición es trabajo de implementación.

Mapa: entrada en círculo para eventos, tienda en cuadrado lima para proveedores. Usar icono y forma para distinguir, además del color. Filtros comunes: tipo, categoría, zona y radio; eventos: fecha y precio de entrada; proveedores: presupuesto, incluyendo precios por cotizar, y disponibilidad por confirmar. Ofrecer geolocalización bajo demanda y búsqueda manual. No mostrar direcciones de celebraciones privadas ni localización de colaboradores.

La cartografía y los marcadores son ilustrativos; no hay coordenadas, distancias ni disponibilidad reales. El prototipo no envía correos ni comparte datos. Verificación de esta revisión: cero desbordes de texto y cero destinos de prototipo inexistentes. Se revisaron visualmente Inicio, mapa móvil/escritorio, invitación, planificación y filtros para proveedores.

## Revisión 1.2: gestión, cobro y aprobación

Mobile y Desktop tienen secciones de Usuario normal, Usuario con negocios y Usuario con eventos publicados, con inicios de prototipo separados. Administración cubre resumen, eventos, negocios, pagos, suscripciones, usuarios y accesos, reportes, actividad y configuración.

Mis eventos publicados muestra todos los eventos públicos creados, incluidos borradores y pendientes, con Crear evento. Mis negocios permite crear, revisar y gestionar perfiles, servicios y solicitudes. El proveedor puede responder una solicitud, revisar la propuesta y confirmar el envío o indicar falta de disponibilidad. El cliente puede revisar el detalle y confirmar una selección, sin efectuar un cobro o contrato en el prototipo.

Planes: S/ 30 al mes por negocio y S/ 100 al mes por evento. Se diseñaron plan, envío de comprobante, recepción, observación y seguimiento de vigencia. Renovación manual; datos del beneficiario y canal de cobro pendientes antes del lanzamiento. No se realizan cargos ni envíos reales.

Publicación: contenido aprobado, pago del periodo verificado y vigencia activa. Recibir una imagen no confirma un pago. Cada decisión administrativa requiere autor, fecha, recurso, estado anterior/nuevo y motivo. Hay confirmaciones de aprobación, verificación, observación, resolución de reporte y suspensión con motivo.

Se revisaron visualmente Mis negocios, Mis eventos publicados, respuesta del proveedor, plan S/ 30, revisión administrativa de evento y solicitudes en escritorio. Auditoría final: cero desbordes de texto y cero destinos inexistentes. También se comprobó que las pantallas móviles organizadas no se solaparan en el lienzo.

## Flujo detallado y storytelling

El archivo añade las páginas 06 Flujo detallado y 07 Storytelling. Son documentación y narrativa, separadas de las pantallas de producto.

Flujo detallado: índice navegable y 10 diagramas editables sobre acceso, colaboración, cotizaciones, mapa, negocios, eventos públicos, administración, renovación, estados y permisos. Los pasos principales enlazan con 50 pantallas originales. Las capacidades de una cuenta y los caminos de evento/proveedor se presentan como ramas alternativas.

Storytelling: 12 escenas navegables, incluida portada y cierre. La historia ilustrativa sigue a Giovanny y Ana, el proveedor Mesa & Momento, un organizador y el equipo autorizado de Eventin. Reutiliza copias editables de pantallas, con sus interacciones internas desactivadas para no interrumpir la narración; los enlaces Ver pantalla original abren la fuente. La creación privada se presenta antes de la invitación a la amistad.

Portada: https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=72-407

Índice de flujo: https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=69-216

Revisión visual: portada, escena de planificación, escena de cotización con dos actores, índice, flujo de cotizaciones y matriz de estados. Auditoría de las páginas nuevas: cero desbordes, cero destinos inexistentes, 105 conexiones y 696 textos editables. Las fotografías son los recursos de referencia ya documentados, no capturas aplanadas de la interfaz.

## Navegación para desarrollo

La página 08 · Navegación técnica documenta 72 rutas propuestas, 119 transiciones y la correspondencia con las 120 pantallas originales. El índice enlaza catálogos por área, mapa global, resolución de URLs, permisos, estados, nueve grupos de pendientes de UX y controles del prototipo que requieren integración.

Índice: https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=87-1564

Entrega técnica: docs/navigation/README.md, eventin-navigation.json, screen-bindings.csv y prototype-snapshot.json. Son un contrato propuesto para implementación; este workspace todavía no contiene un router ni un backend. Verificación de los 33 tableros nuevos: cero desbordes, cero superposiciones y cero destinos inexistentes.

## Fuentes de las fotografías

Fuentes: Unsplash. Imágenes ilustrativas que no representan servicios ni eventos disponibles. Conservar su procedencia y reemplazar por fotografías de proveedores/organizadores cuando existan.

- https://images.unsplash.com/photo-1511795409834-ef04bbd61622
- https://images.unsplash.com/photo-1501386761578-eac5c94b800a
- https://images.unsplash.com/photo-1464366400600-7168b8af9bc3

La paleta y las reglas del manual están en https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=8-2
