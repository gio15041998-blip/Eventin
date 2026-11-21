# Eventin

PWA para organizar celebraciones privadas y descubrir eventos públicos en Perú.

- Organizar: eventos privados, presupuesto, tareas, proveedores y cotizaciones.
- Explorar: cartelera por fecha, categoría y zona, ficha de evento, ubicación y contacto por WhatsApp.
- Negocios: servicios y publicaciones; administración: revisión de contenido y pagos independientes.
- Una cuenta puede tener varias capacidades.
- Un evento privado puede compartirse con una amistad mediante invitación autenticada. Propietario y coorganizador trabajan en presupuesto, tareas y proveedores; el propietario administra accesos.
- La navegación principal es Inicio, Explorar, Mapa, Organizar y Perfil. Favoritos está en la cabecera junto a Notificaciones.
- El mapa reúne eventos públicos y proveedores, con marcadores distintos y filtros por tipo, categoría, zona y radio. Los eventos añaden fecha y precio de entrada; proveedores, presupuesto y servicios por cotizar. Cobertura y disponibilidad se confirman con el proveedor.

Stack acordado: React, TypeScript, Vite, Tailwind CSS, Supabase, PostgreSQL y PostGIS cuando corresponda.

Diseño: https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin

La entrega actual es diseño editable y prototipo Figma. No se ha creado una aplicación ejecutable ni conectado backend. Los negocios y solicitudes son demostrativos. Lima es un ejemplo visual; cobertura, categorías iniciales y proveedor de mapas siguen pendientes.

Tarifas indicadas el 21 de noviembre de 2026: S/ 30 por negocio publicado al mes y S/ 100 por evento público publicado al mes. Se comunicó al comenzar el diseño la interpretación mensual de ambos planes. El MVP conserva cobro y renovación manuales; no se realizan cargos automáticos. Publicar requiere contenido aprobado, pago del periodo verificado y vigencia válida. El evento deja de publicarse cuando finaliza.

Mobile y Desktop separan usuario normal, usuario con negocios y usuario con eventos públicos. Administración está en una página exclusiva. Una cuenta puede tener varias capacidades; pagar un plan no concede permisos administrativos.
