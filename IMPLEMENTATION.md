# Eventin · Registro de implementación

> **Estado actual:** frontend Mobile y Desktop conectado a Proyecto Eventin mediante `LiveStoreProvider`, Supabase Auth, PostgreSQL/RLS y RPC. Ver `docs/supabase-setup.md` para el estado verificable y pendientes de entrega. Los apartados siguientes documentan la fase demo original y su alineación visual; sus pendientes de Supabase quedan sustituidos por ese documento.
> **Pagos:** deshabilitados por indicación del propietario. Izipay queda pendiente; no se reciben comprobantes ni se activa publicación por pagar desde el navegador.

---

## 1. Alineamiento Visual, Tokens y Activos de Figma

- **Identidad y Tokens (`eventin-tokens.css` y `src/styles.css`)**:
  - Tipografía **Manrope** (400–800) con `tabular-nums` en montos en soles (`PEN S/`), fechas y contadores.
  - Paleta oficial: marca `#145C46`, hover `#0D4535`, acento `#D7EF98`, sutil `#E7F3ED`, texto `#172D28`, secundario `#566A63`, fondo `#F6F8F7`, borde `#DCE4DF`.
  - Radios: `12px` en controles e inputs, `16px` en tarjetas, `24px` en contenedores hero; espaciado base `24px` móvil y `80px` desktop en el shell principal.
- **Activos Locales (`public/figma-assets/` y `design-reference/`)**:
  - Se sincronizaron **46 archivos locales** (`43 SVG + 3 PNG`) desde el árbol de referencia `81912e19f27ff5e5a9bf96da0258826ebb4a4989`, manteniendo los paths locales en `/figma-assets/*` sin URLs temporales de Figma ni imágenes externas de stock.
  - **Marca oficial (`src/components/ui/BrandLogo.tsx`)**: utiliza `/figma-assets/56f1e19891a7a518bf6a9c40e227b4588595e51257bd7aa16fddba4d33a624db.svg` (`Brand/Isotipo`) junto con la palabra `eventin` en `Manrope` ExtraBold.
  - **Mapa ilustrativo (`src/pages/PublicPages.tsx`)**: utiliza el asset local `/figma-assets/378b7e254c83a484f6d9a1f976bf485cfd17ca9831efd5d483750d3e14179a38.svg` (`Map/Base ilustrativa`) con pines diferenciados (Eventos en círculo con ticket, Proveedores en cuadrado lima `#D7EF98`).
  - **Web limpio sin marcos telefónicos ficticios**: se omitieron las barras ficticias de sistema operativo (`9:41`, `5G 100%`) de los mockups móviles al renderizar en navegador web y se preservó la barra inferior móvil de 5 destinos (`Inicio`, `Explorar`, `Mapa`, `Organizar`, `Perfil`).
- **Alineación de alta fidelidad con `design-reference/*.tsx.reference`**:
  - **Inicio (`desktop/home` `9:19` y `mobile/home` `6:2`)**: imagen celebrativa original (`/figma-assets/0fcdeffa...png`), sin *eyebrow* sobre `«Haz espacio para un buen plan.»`, subtítulo `«Organiza una celebración con el equipo ideal o descubre qué está pasando cerca de ti.»`, selector de fecha (`Cualquier fecha` / `?desde=`) en el buscador horizontal, 3 eventos públicos destacados (`Una noche al aire libre`, `Feria de sabores`, `Sesiones al atardecer`) y vista móvil con `Planes cerca de ti` + `Diseña tu próxima celebración`.
  - **Planificación privada (`desktop/planner` `9:215` y `mobile/budget` `7:292`)**: sidebar blanco fijo de `248px` pegado a la izquierda en escritorio (`PlannerWorkspaceShell`, sin cabecera ni pie público adicional), metadatos de `Cumpleaños de Valeria · Datos de ejemplo`, bloque único verde claro (`#E7F3ED`) con 3 columnas (`S/ 2,500`, `S/ 980`, `S/ 1,520`) y avance `39%`, seguido por `Tabla de servicios` (izquierda) y `Próximos pasos` (derecha) en columnas paralelas, y diseño apilado en móvil.
  - **Mapa (`desktop/map` `34:242`)**: panel lateral `¿Qué buscas?` con filtros (`Todos / Eventos / Proveedores`, categoría, distancia, fecha, precio, checkbox `Incluir proveedores «Por cotizar»` y botón `Aplicar filtros`) junto al lienzo ilustrativo `#E7F3ED` con buscador integrado, botón `Mi ubicación`, leyenda y tarjeta de detalle seleccionable.
  - **Equipo, Negocios, Publicaciones y Cuenta**: layouts de 2 columnas en `desktop/team`, `desktop/businesses`, `desktop/requests`, `desktop/reply`, `desktop/businessReview`, `desktop/businessPayment`, `desktop/eventReview`, `desktop/eventPayment`, tabla `Evento | Fecha | Publicación | Pago` en `desktop/business` (con borrador `evt-borrador-demo` y acción `Continuar edición →`), más vistas apiladas en móvil (`mobile/organize`, `mobile/publications`, `mobile/profile`).
- **Tratamiento de los 10 contextos faltantes (`design-reference/missing.json`)**:
  - Los 10 frames que no pudieron recuperarse por cuota (`mobile/declineSent`, `mobile/responded`, `desktop/explore`, `desktop/favorites`, `desktop/notifications`, `desktop/replyConfirm`, `desktop/replySent`, `desktop/businessCreate`, `desktop/businessReceipt`, `desktop/account`) se implementaron conservando exactamente el flujo funcional del contrato y la familia visual correspondiente (listas, filtros, tarjetas de detalle, modales de confirmación y estados de resultado), sin inventar elementos fuera de los tokens definidos.

---

## 2. Cobertura Completa de Rutas (72 / 72 Rutas Canónicas)

Todas las rutas declaradas en `docs/navigation/eventin-navigation.json` están montadas en `src/App.tsx` (con prioridad explícita de rutas estáticas sobre parámetros dinámicos) más ruta `*` para estado 404.

### A. Descubrimiento Público (6 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `home` | `/` | `PUBLIC` | `PublicPages.tsx` → `HomePage` | `mobile/home` (`6:2`), `desktop/home` (`9:19`) |
| `explore` | `/explorar` | `PUBLIC` | `PublicPages.tsx` → `ExplorePage` | `mobile/explore` (`6:76`), `desktop/explore`* |
| `map` | `/mapa` | `PUBLIC` | `PublicPages.tsx` → `MapPage` | `mobile/map` (`32:744` + paneles URL), `desktop/map` (`34:242`) |
| `provider.list` | `/proveedores` | `PUBLIC` | `PublicPages.tsx` → `ProviderListPage` | `mobile/providers` (`6:322`) |
| `provider.detail` | `/proveedores/:businessId` | `PUBLIC_VISIBLE` | `PublicPages.tsx` → `ProviderDetailPage` | `mobile/supplier` (`7:348`) |
| `event.public` | `/eventos/:publicEventId` | `PUBLIC_VISIBLE` | `PublicPages.tsx` → `PublicEventDetailPage` | `mobile/event` (`6:145`) |

### B. Autenticación Demo y Retorno Seguro (5 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `auth.login` | `/acceder` | `GUEST_OR_SESSION` | `AuthPages.tsx` → `LoginPage` | `mobile/login` (`7:718`) |
| `auth.register` | `/registro` | `GUEST_OR_SESSION` | `AuthPages.tsx` → `RegisterPage` | `mobile/register` (`11:619`) |
| `auth.recovery` | `/recuperar-acceso` | `GUEST_OR_SESSION` | `AuthPages.tsx` → `RecoveryPage` | Flujo de recuperación de contraseña |
| `auth.reset` | `/restablecer-acceso` | `GUEST_OR_SESSION` | `AuthPages.tsx` → `ResetPage` | Flujo de nueva contraseña |
| `auth.callback` | `/auth/callback` | `PUBLIC` | `AuthPages.tsx` → `CallbackPage` | Retorno OAuth/Magic Link (`isSafeInternalReturnTo`) |

### C. Cuenta Personal, Favoritos y Notificaciones (3 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `account` | `/cuenta` | `AUTH` | `PersonalPages.tsx` → `AccountPage` | `mobile/profile` (`7:558`), `desktop/account`* |
| `favorites` | `/favoritos` | `AUTH` | `PersonalPages.tsx` → `FavoritesPage` | `mobile/favorites` (`7:501`), `desktop/favorites`* |
| `notifications` | `/notificaciones` | `AUTH` | `PersonalPages.tsx` → `NotificationsPage` | `mobile/notifications` (`33:1032`), `desktop/notifications`* |

### D. Organización Privada y Equipo (6 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `private.list` | `/mis-eventos` | `AUTH` | `PrivatePlannerPages.tsx` → `PrivateListPage` | `mobile/organize` (`6:195`) |
| `private.create` | `/mis-eventos/nuevo` | `AUTH` | `PrivatePlannerPages.tsx` → `PrivateCreatePage` | `mobile/create` (`6:253`) |
| `private.detail` | `/mis-eventos/:privateEventId` | `EVENT_MEMBER` | `PrivatePlannerPages.tsx` → `PrivateDetailPage` | `mobile/budget` (`7:292`), `desktop/planner` (`9:215`) |
| `private.team` | `/mis-eventos/:privateEventId/equipo` | `EVENT_MEMBER` | `PrivatePlannerPages.tsx` → `PrivateTeamPage` | `mobile/team`, `pending`, `desktop/team` (`34:331`) |
| `private.invite` | `/mis-eventos/:privateEventId/invitaciones/nueva` | `EVENT_OWNER` | `PrivatePlannerPages.tsx` → `PrivateInvitePage` | `mobile/invite` (`33:935`) |
| `invite.accept` | `/invitaciones/:inviteToken` | `INVITE_RECIPIENT` | `PrivatePlannerPages.tsx` → `InviteAcceptPage` | `mobile/accept` (`33:988`) |

### E. Flujo de Cotizaciones — Cliente (5 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `quote.list` | `/mis-eventos/:privateEventId/cotizaciones` | `EVENT_MEMBER` | `QuotePages.tsx` → `QuoteListPage` | `mobile/quotes` (`7:448`) |
| `quote.create` | `/mis-eventos/:privateEventId/solicitudes/nueva` | `EVENT_MEMBER` | `QuotePages.tsx` → `QuoteCreatePage` | `mobile/quote` (`7:393`) |
| `quote.request` | `/mis-eventos/:privateEventId/solicitudes/:requestId` | `EVENT_MEMBER` | `QuotePages.tsx` → `QuoteRequestPage` | `mobile/sent` (`11:719`) |
| `quote.compare` | `/mis-eventos/:privateEventId/propuestas/comparar` | `EVENT_MEMBER` | `QuotePages.tsx` → `QuoteComparePage` | `mobile/compare` (`16:705`), `desktop/compare` (`12:253`) |
| `quote.detail` | `/mis-eventos/:privateEventId/propuestas/:proposalId` | `EVENT_MEMBER` | `QuotePages.tsx` → `QuoteDetailPage` | `mobile/clientProposal`, `clientSelectConfirm`, `clientSelected` |

### F. Negocios y Proveedores — Plan S/ 30/mes (17 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `business.list` | `/cuenta/negocios` | `AUTH` | `BusinessPages.tsx` → `BusinessListPage` | `mobile/businesses`, `desktop/businesses` (`52:380`) |
| `business.create` | `/cuenta/negocios/nuevo` | `AUTH` | `BusinessPages.tsx` → `BusinessFormPage (create)` | `mobile/businessCreate` (`44:1287`), `desktop/businessCreate`* |
| `business.edit` | `/cuenta/negocios/:businessId/editar` | `BUSINESS_EDITOR` | `BusinessPages.tsx` → `BusinessFormPage (edit)` | Reutiliza `businessCreate` (`44:1287`) |
| `business.detail` | `/cuenta/negocios/:businessId` | `BUSINESS_MEMBER` | `BusinessPages.tsx` → `BusinessDetailPage` | `businessDetail`, `Pending`, `Published`, `Changes` |
| `business.review` | `/cuenta/negocios/:businessId/revisar` | `BUSINESS_EDITOR` | `BusinessPages.tsx` → `BusinessReviewPage` | `mobile/businessReview`, `desktop/businessReview` |
| `business.services` | `/cuenta/negocios/:businessId/servicios` | `BUSINESS_MEMBER` | `BusinessPages.tsx` → `BusinessServicesPage` | `mobile/services` (`46:1935`) |
| `business.serviceNew` | `/cuenta/negocios/:businessId/servicios/nuevo` | `BUSINESS_EDITOR` | `BusinessPages.tsx` → `BusinessServiceFormPage` | Reutiliza `mobile/serviceEdit` (`46:1984`) |
| `business.serviceEdit` | `/cuenta/negocios/:businessId/servicios/:serviceId/editar` | `BUSINESS_EDITOR` | `BusinessPages.tsx` → `BusinessServiceFormPage` | `mobile/serviceEdit` (`46:1984`) |
| `business.requests` | `/cuenta/negocios/:businessId/solicitudes` | `BUSINESS_MEMBER` | `BusinessPages.tsx` → `BusinessRequestsPage` | `mobile/requests`, `responded`*, `desktop/requests` |
| `business.request` | `/cuenta/negocios/:businessId/solicitudes/:requestId` | `BUSINESS_MEMBER` | `BusinessPages.tsx` → `BusinessRequestDetailPage` | `requestDetail`, `replySent`, `decline`, `declineSent`* |
| `business.reply` | `/cuenta/negocios/:businessId/solicitudes/:requestId/respuesta` | `BUSINESS_EDITOR` | `BusinessPages.tsx` → `BusinessReplyPage` | `mobile/reply`, `desktop/reply` (`52:456`) |
| `business.replyReview` | `/cuenta/negocios/:businessId/solicitudes/:requestId/respuesta/revisar` | `BUSINESS_EDITOR` | `BusinessPages.tsx` → `BusinessReplyReviewPage` | `mobile/replyReview`, `desktop/replyConfirm`* |
| `business.plan` | `/cuenta/negocios/:businessId/plan` | `BUSINESS_BILLING` | `BusinessPages.tsx` → `BusinessPlanPage` | `mobile/businessPlan` (`45:1391`) |
| `business.checkout` | `/cuenta/negocios/:businessId/pagos/nuevo` | `BUSINESS_BILLING` | `BusinessPages.tsx` → `BusinessCheckoutPage` | `mobile/businessPayment`, `desktop/businessPayment` |
| `business.payment` | `/cuenta/negocios/:businessId/pagos/:paymentId` | `BUSINESS_BILLING` | `BusinessPages.tsx` → `BusinessPaymentPage` | `businessReceipt`, `businessPaymentIssue`, `desktop/businessReceipt`* |
| `business.billing` | `/cuenta/negocios/:businessId/facturacion` | `BUSINESS_BILLING` | `BusinessPages.tsx` → `BusinessBillingPage` | `mobile/businessBilling` (`45:1533`) |
| `business.paymentInfo` | `/cuenta/negocios/:businessId/pagos/instrucciones` | `BUSINESS_BILLING` | `BusinessPages.tsx` → `BusinessPaymentInfoPage` | `mobile/businessPayInfo` (`51:2382`) |

### G. Publicación de Eventos Públicos — Plan S/ 100/mes (11 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `publication.list` | `/cuenta/publicaciones` | `AUTH` | `PublicationPages.tsx` → `PublicationListPage` | `mobile/publications`, `desktop/business` (`9:299`) |
| `publication.create` | `/cuenta/publicaciones/nueva` | `AUTH` | `PublicationPages.tsx` → `PublicationFormPage (create)` | `mobile/publish`, `desktop/eventCreate` |
| `publication.detail` | `/cuenta/publicaciones/:publicEventId` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationDetailPage` | `publicationDetail`, `eventPending`, `eventPublished`, `eventChanges` |
| `publication.edit` | `/cuenta/publicaciones/:publicEventId/editar` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationFormPage (edit)` | Reutiliza `mobile/publish` (`7:654`) |
| `publication.details` | `/cuenta/publicaciones/:publicEventId/editar/detalles` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationDetailsPage` | `mobile/eventDetails` (`47:2010`) |
| `publication.review` | `/cuenta/publicaciones/:publicEventId/revisar` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationReviewPage` | `mobile/review`, `desktop/eventReview` |
| `publication.plan` | `/cuenta/publicaciones/:publicEventId/plan` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationPlanPage` | `mobile/eventPlan` (`45:1618`) |
| `publication.checkout` | `/cuenta/publicaciones/:publicEventId/pagos/nuevo` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationCheckoutPage` | `mobile/eventPayment`, `desktop/eventPayment` |
| `publication.payment` | `/cuenta/publicaciones/:publicEventId/pagos/:paymentId` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationPaymentPage` | `eventReceipt`, `eventPaymentIssue`, `desktop/eventReceipt` |
| `publication.billing` | `/cuenta/publicaciones/:publicEventId/facturacion` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationBillingPage` | `mobile/eventBilling` (`45:1760`) |
| `publication.paymentInfo` | `/cuenta/publicaciones/:publicEventId/pagos/instrucciones` | `PUBLICATION_OWNER` | `PublicationPages.tsx` → `PublicationPaymentInfoPage` | `mobile/eventPayInfo` (`51:2418`) |

### H. Consola Administrativa (19 rutas)

| Route ID | Ruta | Guarda | Módulo / Componente | Referencia Figma |
| :--- | :--- | :--- | :--- | :--- |
| `admin.home` | `/admin` | `ADMIN` | `AdminPages.tsx` → `AdminHomePage` | `admin/dashboard` (`48:19`) |
| `admin.events` | `/admin/eventos` | `ADMIN_EVENT_REVIEW` | `AdminPages.tsx` → `AdminEventsPage` | `admin/events` (`48:113`) |
| `admin.event` | `/admin/eventos/:publicEventId` | `ADMIN_EVENT_REVIEW` | `AdminPages.tsx` → `AdminEventDetailPage` | `eventReview`, `eventApprove`, `eventApproved`, `decisionRecorded` |
| `admin.eventDecision` | `/admin/eventos/:publicEventId/decision` | `ADMIN_EVENT_REVIEW` | `AdminPages.tsx` → `AdminEventDecisionPage` | `admin/eventObservation` (`49:556`) |
| `admin.businesses` | `/admin/negocios` | `ADMIN_BUSINESS_REVIEW` | `AdminPages.tsx` → `AdminBusinessesPage` | `admin/businesses` (`48:205`) |
| `admin.business` | `/admin/negocios/:businessId` | `ADMIN_BUSINESS_REVIEW` | `AdminPages.tsx` → `AdminBusinessDetailPage` | `businessReview`, `businessApprove`, `businessApproved`, `decisionRecorded` |
| `admin.businessDecision` | `/admin/negocios/:businessId/decision` | `ADMIN_BUSINESS_REVIEW` | `AdminPages.tsx` → `AdminBusinessDecisionPage` | `admin/businessObservation` (`49:823`) |
| `admin.payments` | `/admin/pagos` | `ADMIN_PAYMENT_VERIFY` | `AdminPages.tsx` → `AdminPaymentsPage` | `admin/payments` (`48:288`) |
| `admin.payment` | `/admin/pagos/:paymentId` | `ADMIN_PAYMENT_VERIFY` | `AdminPages.tsx` → `AdminPaymentDetailPage` | `eventPaymentReview`/`Confirm`/`Verified`, `businessPaymentReview`/`Confirm`/`Verified` |
| `admin.paymentObservation` | `/admin/pagos/:paymentId/observacion` | `ADMIN_PAYMENT_VERIFY` | `AdminPages.tsx` → `AdminPaymentObservationPage` | `admin/paymentObservation` (`50:987`) |
| `admin.subscriptions` | `/admin/suscripciones` | `ADMIN_SUBSCRIPTION` | `AdminPages.tsx` → `AdminSubscriptionsPage` | `admin/subscriptions` (`48:371`) |
| `admin.subscription` | `/admin/suscripciones/:subscriptionId` | `ADMIN_SUBSCRIPTION` | `AdminPages.tsx` → `AdminSubscriptionDetailPage` | `admin/subscriptionDetail` (`56:1040`) |
| `admin.users` | `/admin/usuarios` | `ADMIN_USER_MANAGE` | `AdminPages.tsx` → `AdminUsersPage` | `admin/users` (`48:463`) |
| `admin.user` | `/admin/usuarios/:userId` | `ADMIN_USER_MANAGE` | `AdminPages.tsx` → `AdminUserDetailPage` | `userDetail`, `suspendConfirm`, `suspended` |
| `admin.reports` | `/admin/reportes` | `ADMIN_REPORT_MANAGE` | `AdminPages.tsx` → `AdminReportsPage` | `admin/reports` (`48:546`) |
| `admin.report` | `/admin/reportes/:reportId` | `ADMIN_REPORT_MANAGE` | `AdminPages.tsx` → `AdminReportDetailPage` | `reportDetail`, `decisionRecorded` |
| `admin.reportResolve` | `/admin/reportes/:reportId/resolver` | `ADMIN_REPORT_MANAGE` | `AdminPages.tsx` → `AdminReportResolvePage` | `admin/reportDecision` (`56:976`) |
| `admin.audit` | `/admin/actividad` | `ADMIN_AUDIT_READ` | `AdminPages.tsx` → `AdminAuditPage` | `admin/audit` (`50:1236`) |
| `admin.settings` | `/admin/configuracion/publicaciones` | `ADMIN_CONFIG_MANAGE` | `AdminPages.tsx` → `AdminSettingsPage` | `admin/settings` (`50:1304`) |

*(\* Contexto listado en `design-reference/missing.json`; se preserva el flujo del contrato con su familia UI correspondiente).*

---

## 3. Reglas de Dominio y Controles Demo Implementados

- **Publicación y Visibilidad (`src/domain/predicates.ts`)**:
  - `isPublicEventVisible`: exige `contentStatus === 'approved'`, `paymentStatus === 'verified'`, `subscriptionActive === true` y fecha de cierre vigente (`!isEventEnded`).
  - `isBusinessVisible`: exige `contentStatus === 'approved'`, `paymentStatus === 'verified'` y `subscriptionActive === true`.
- **Autorización por Evento Privado y Co-organización**:
  - `canAccessPrivateEvent` y `isPrivateEventOwner` restringen acceso a presupuesto, tareas, equipo y cotizaciones a miembros con registro activo (`GuardDenied403`).
  - `evaluateInvitation` valida token, estado (`revoked`, `accepted`, `expired`) y coincidencia con la cuenta conectada (`wrong_account`).
- **Cotizaciones y Vigencia**:
  - `isProposalActionable` bloquea propuestas vencidas (`expiresAt`), cerradas o rechazadas; seleccionar una propuesta exige confirmación explícita (`ConfirmModal`) y aclara que en el prototipo no efectúa cobros ni crea un contrato vinculante.
- **Planes PEN (`S/ 30` negocio/mes y `S/ 100` evento/mes)**:
  - Flujo completo de selección de plan → instrucciones de cobro → envío de comprobante con número de operación → revisión/observación administrativa (`payment.verify` / `payment.observe`).
  - Toda pantalla de pago, autenticación y catálogo demo muestra etiquetas explícitas de **datos y operaciones de demostración**.

---

## 4. Brechas Materiales Pendientes para Producción (Supabase)

Al tratarse de una fase frontend demo solicitada sin backend conectado, quedan pendientes las siguientes integraciones antes de habilitar operación real:

1. **Autenticación real (Supabase Auth)**:
   - Reemplazar el selector de cuentas demo en `AuthPages.tsx` / `demoStore.tsx` por `supabase.auth` (correo/contraseña, magia/OAuth y manejo real de sesión en `/auth/callback`).
2. **Base de datos PostgreSQL + Row Level Security (RLS) + PostGIS**:
   - Migrar el estado de `demoStore.tsx` a tablas reales (`profiles`, `private_events`, `event_memberships`, `event_invitations`, `businesses`, `business_services`, `public_events`, `quote_requests`, `proposals`, `payments`, `subscriptions`, `reports`, `audit_logs`, `notifications`, `platform_settings`).
   - Hacer cumplir en servidor (RLS + Edge Functions / RPCs) todas las guardas (`EVENT_MEMBER`, `BUSINESS_EDITOR`, `PUBLICATION_OWNER`, `ADMIN_*` y visibilidad pública).
3. **Verificación de Pagos y Storage Real**:
   - Subida real de imágenes de portada y comprobantes a Supabase Storage (buckets con políticas firmadas), verificación contable en servidor antes de activar suscripciones de `S/ 30` o `S/ 100`, y configuración real de titulares/números Yape o cuentas bancarias desde servidor.
4. **Geolocalización y Mapas Reales**:
   - Integrar proveedor de mapas/geocodificación (Google Maps o Mapbox) y consultas geoespaciales reales por radio en Lima Metropolitana reemplazando el mapa ilustrativo actual.
5. **Envío Real de Correos y Notificaciones**:
   - Envío real de invitaciones a co-organizadores, alertas de cotización y restablecimiento de contraseña vía SMTP / Resend / Supabase Auth Hooks.

---

## 5. Verificación Realizada

- `npm run typecheck` (`tsc --noEmit`): **0 errores**.
- `npm run build` (`tsc --noEmit && vite build`): **compilación exitosa** (`compile_applet`).
- **Validación automática contra contrato (`docs/navigation/eventin-navigation.json`), renderizado React SSR (`StaticRouter`) y predicados (`src/domain/predicates.ts`)**:
  - 72 / 72 rutas canónicas presentes en `src/App.tsx` (más fallback `*` 404).
  - 46 / 46 archivos locales presentes en `public/figma-assets/` (sin URLs temporales de Figma ni imágenes externas de stock).
  - 16 rutas representativas de todas las áreas (público, mapa, planner `9:215`, equipo, comparación, cuenta, negocios, publicaciones con borrador `evt-borrador-demo` y admin) renderizadas sin errores verificando montos `S/ 2,500 / S/ 980 / S/ 1,520 (39%)`, `S/ 30` y `S/ 100`.
  - Predicados de visibilidad (`isPublicEventVisible`, `isBusinessVisible`), validación de invitaciones (`evaluateInvitation`) y sanitización de retorno (`isSafeInternalReturnTo`) verificados con `tsx`.

