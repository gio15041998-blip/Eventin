# Conexión de Eventin a Supabase

> Registro histórico de la preparación inicial. El estado vigente está en [supabase-setup.md](supabase-setup.md); las referencias siguientes a base vacía y datos demo describen el estado anterior a la implementación real.

Estado: proyecto remoto identificado y acceso de administración verificado. Se configuró la copia local con URL y clave publishable en `.env.local`, excluido del repositorio. La interfaz continúa con datos demo. Añadir variables no reemplaza automáticamente `demoStore.tsx`. Google AI Studio todavía no tiene esta configuración aplicada.

## Proyecto seleccionado y comprobaciones

- Nombre: Proyecto Eventin.
- Referencia: `adbiafdfzavahlrwtevk`.
- Organización: Proyectos. Región: us-east-2.
- URL: `https://adbiafdfzavahlrwtevk.supabase.co`.
- Estado remoto: ACTIVE_HEALTHY. PostgreSQL 17.12.
- Consulta SQL de lectura ejecutada correctamente mediante el conector.
- Auth responde HTTP 200 con la clave publishable.
- El esquema `public` no contiene tablas de aplicación. El asesor de seguridad no devuelve avisos.
- La descripción OpenAPI de Data API exige una clave privada; se conserva esa restricción. El acceso público a tablas deberá verificarse después de crear tablas y políticas.

`npm run check:supabase` reproduce las comprobaciones HTTP sin crear cuentas ni modificar datos. No prueba persistencia ni permisos entre usuarios.

## Configuración de la aplicación

`VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` pertenecen al proyecto seleccionado. Se admite `VITE_SUPABASE_ANON_KEY` como alternativa heredada. Configurarlas en el entorno privado de desarrollo y en Google AI Studio; nunca introducir una clave secret o service_role en variables VITE ni en el repositorio.

`src/lib/supabase.ts` crea un cliente único de forma diferida, con sesión persistente y flujo PKCE. La validación local comprueba configuración y tipo de clave; no demuestra disponibilidad del servidor, políticas de acceso o integraciones.

## Pasos pendientes para activar datos reales

1. Crear el esquema de aplicación y las políticas a partir de la base vacía inspeccionada; revisar Storage antes de crear buckets.
2. Registrar las URLs autorizadas del frontend real y `/auth/callback` y `/restablecer-acceso`. No utilizar la dirección del editor AI Studio como origen de la aplicación: la vista previa tiene su propio dominio.
3. Reemplazar el acceso demo con operaciones asíncronas de Auth y perfiles reales. No activar selectores de usuarios demo ni permisos administrativos elegibles por el cliente en modo real.
4. Definir migraciones incrementales y RLS para eventos privados, miembros, tareas, presupuesto y favoritos; verificar separación entre dos usuarios y acceso de coorganizadores aceptados.
5. Conectar negocios, servicios, publicaciones y cotizaciones. Confirmaciones solo después de respuesta del servidor; no escribir cambios de aprobación ni precios de planes desde clientes sin privilegios.
6. Configurar Storage para portadas y comprobantes con acceso apropiado. Separar moderación de contenido, revisión de pagos y vigencia mediante operaciones de servidor auditadas.
7. Probar registro, acceso, recuperación, persistencia tras recarga, aislamiento entre cuentas, invitaciones y denegación de acceso desde URLs directas.

Los proveedores de mapas, SMTP y cobros son integraciones adicionales; no quedan activados por conectar Supabase.

## Verificación local

`node --test tests/supabase-config.test.mjs`: cuatro pruebas de configuración, claves públicas/privadas y URLs. Verificación HTTP y SQL descrita arriba. Las pantallas con datos reales siguen pendientes de implementar y verificar.

Fuentes: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs y https://supabase.com/docs/guides/database/postgres/row-level-security
