# Eventin

Aplicación web para planificar celebraciones privadas de forma colaborativa, descubrir eventos públicos y encontrar proveedores en Perú.

Repositorio autorizado del proyecto: **gio15041998-blip/Eventin**. Construir y guardar aquí. No utilizar PruebaCodex.

## Construcción

React + TypeScript + Vite + Tailwind. Backend objetivo: Supabase/PostgreSQL; no inventar credenciales. Lee `PRODUCT.md`, `DESIGN.md`, `docs/navigation/README.md` y `docs/navigation/eventin-navigation.json` antes de implementar.

El contrato define 72 rutas, 119 transiciones y 120 pantallas de referencia Figma. La aplicación utiliza Supabase real y añade `/configurar-admin` para activar la primera cuenta administradora con un código de instalación de un solo uso. Consulta `docs/supabase-setup.md` para configuración, pruebas y límites. Los pagos están deshabilitados mientras se prepara una futura integración con Izipay.

Desarrollo: `pnpm install --frozen-lockfile`, `pnpm dev`. Validación: `pnpm typecheck`, `pnpm build`, `node --test tests/supabase-config.test.mjs`, `pnpm check:supabase`. La configuración pública de Proyecto Eventin está en `src/lib/supabaseProject.ts`; variables de entorno permiten sustituirla. Nunca incluir claves secret o service_role en el cliente.

Diseño: https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin
