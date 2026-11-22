# Supabase de Eventin

Proyecto: **Proyecto Eventin**, referencia `adbiafdfzavahlrwtevk`, organización Proyectos, región us-east-2. No se creó otro proyecto ni se cambió el plan.

## Implementado

- 18 tablas en public: perfiles, configuración y 16 colecciones de producto. UUID, claves relacionales para propietarios, eventos y negocios, e índices para esas consultas.
- RLS en todas las tablas. Las lecturas se filtran en PostgreSQL; las escrituras del cliente se realizan mediante comandos con permisos y validaciones de servidor. La UI no puede aprobarse, concederse roles o marcar sus pagos como verificados.
- Supabase Auth: registro con contraseña y confirmación de correo, acceso, cierre, recuperación y callback PKCE. Cada alta crea un perfil sin privilegios administrativos.
- Eventos privados, miembros, invitaciones temporales y revocables, destinatario autenticado, presupuesto y tareas compartidas.
- Negocios, servicios y publicaciones con borradores, envío a revisión, versión y moderación auditada.
- Solicitudes, borradores privados de propuestas, envío, selección y creación del concepto confirmado en presupuesto. Repetir selección de la misma propuesta no duplica el concepto.
- Favoritos, notificaciones internas, suspensión de cuentas y resolución de reportes existentes.
- Storage: portadas públicas JPG/PNG/WebP hasta 5 MB; escritura solo en la carpeta de la cuenta activa. Los cambios de portada devuelven el contenido a borrador. Documentos privados separados y sin escritura de cliente mientras los pagos estén deshabilitados.
- Proveedor de estado real por defecto. No se inyectan datos demo en Supabase. Después de cada escritura se vuelve a leer el servidor; colaboradores refrescan al volver a la ventana y cada 20 segundos.

Las colecciones guardan documentos JSONB compatibles con el dominio TypeScript; propietario, evento y negocio también tienen columnas UUID indexadas para permisos y relaciones. El esquema no es una copia del estado global del navegador. El código demo se conserva como referencia y no se monta en el router real.

## Primera cuenta administradora

1. Registrar y confirmar la cuenta desde la app.
2. Abrir `/configurar-admin` con esa sesión.
3. Introducir el código del archivo **local** `.admin-bootstrap.txt`. El archivo está excluido de GitHub y no se incluye en paquetes para AI Studio.
4. La operación comprueba correo confirmado y consume el código de forma atómica. El servidor guarda únicamente su hash; después de usarlo, no puede activar otra cuenta. La asignación queda auditada.

No se convierte al primer usuario público en administrador. El código no debe publicarse, adjuntarse a AI Studio ni introducirse en URLs. El acceso posterior a `/admin` depende de los permisos guardados en la base.

## Pagos e Izipay

Por indicación del propietario, los pagos están deshabilitados en interfaz y servidor. Se conservan precios S/30 y S/100 como planes, pero ningún envío de comprobante ni verificación de pago se admite. Aprobar contenido no activa una suscripción. La cartelera exige aprobación, pago verificado y periodo activo; por tanto los borradores nuevos no se publicarán hasta implementar la futura pasarela.

No se han configurado credenciales de Izipay, webhooks ni cargos automáticos.

## Verificación

- Pruebas transaccionales `tests/supabase-rls.sql`: aislamiento de cuentas, intento de escalada administrativa, invitación pendiente, destinatario incorrecto, aceptación, tareas compartidas, permisos del propietario, protección de aprobación/pago, solicitudes/propuestas/selección idempotente, auditoría, moderación y activación de un solo uso. Los fixtures se revierten con ROLLBACK.
- API pública `eventin_snapshot` comprobada con el SDK usando únicamente la clave publishable: no devuelve perfiles ni eventos privados a visitantes.
- Asesor de seguridad de Supabase sin avisos después de aplicar el esquema.
- TypeScript y compilación de Vite comprobados. La advertencia de tamaño del bundle sigue pendiente de optimización.

Los archivos `supabase/schema/*.sql` son la fuente del esquema. Las aplicaciones remotas se registraron con `apply_migration`; consultar el historial remoto antes de cualquier despliegue adicional. No volver a aplicar la fundación sobre una base existente.

## Configuración y pendientes externos

- Auth debe autorizar los orígenes reales de la aplicación y los callbacks `/auth/callback` y `/restablecer-acceso`; no usar como origen la URL del editor AI Studio. Mantener confirmación de correo. No se necesita clave privada para el frontend.
- Para correo público a usuarios, configurar un proveedor SMTP propio; el servicio de correo de desarrollo de Supabase puede limitar destinatarios y volumen. No afirmar entrega de correos hasta probarla con una cuenta del propietario.
- Las invitaciones se comparten por enlace: no se contrató un servicio de envío de invitaciones por correo.
- El mapa conserva la cartografía ilustrativa del diseño; geocodificación, coordenadas y distancias reales requieren una integración de mapas adicional.
- La identidad del propietario debe activarse desde la app. El agente no creó una contraseña para esa cuenta.

Fuentes oficiales: https://supabase.com/docs/guides/auth/quickstarts/react y https://supabase.com/docs/guides/database/postgres/row-level-security y https://supabase.com/docs/guides/storage/security/access-control
