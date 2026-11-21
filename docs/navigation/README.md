# Eventin · Contrato de navegación para desarrollo

Estado: propuesta de implementación derivada del diseño, 21 de noviembre de 2026. No existe todavía una aplicación ejecutable, router o backend en este workspace. Las rutas de este documento son canónicas propuestas, no URLs ya implementadas.

## Archivos

[Abrir el índice navegable en Figma](https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=87-1564). La página **08 · Navegación técnica** contiene el mapa global, el catálogo de rutas, las transiciones y las reglas de acceso y retorno.

Los campos de formulario pueden ser locales o borradores. `stateSource` identifica la autoridad del estado representado; los permisos, pagos, aprobación y resultados de operaciones se validan en el servidor.

- `eventin-navigation.json`: rutas, parámetros, guardas, transiciones, comandos lógicos, notificaciones y pendientes.
- `screen-bindings.csv`: correspondencia de cada pantalla Figma con ruta, variante y superficie.
- `prototype-snapshot.json`: evidencia del prototipo actual. Sus atajos no sustituyen las condiciones de producción.

Cobertura: 120 pantallas únicas, 72 rutas propuestas y 119 transiciones. Varias pantallas son estados de una sola ruta. Mobile y Desktop comparten URLs.

## Convenciones

1. Una ruta identifica un recurso o una tarea. Un modal se refleja en query solo si aporta navegación profunda. Un mensaje de éxito deriva de una operación confirmada y del estado real; nunca de `?success=true`.
2. Resolver sesión → comprobar permisos del recurso → cargar datos → resolver estado → renderizar. Ocultar un botón no reemplaza la validación del servidor.
3. Usar IDs del resultado de creación. No abrir presupuesto, revisión o recibo antes de que exista el recurso.
4. Tras autenticación, volver solo a una ruta interna permitida y revalidar autorización. No enviar una solicitud, seleccionar propuesta o verificar pago automáticamente al volver.
5. Confirmaciones no mutan al abrirse. Cancelar o Atrás no cambia datos. Tras éxito, `replace` evita que Atrás repita el envío; las escrituras deben contemplar idempotencia.
6. `command` contiene un nombre de operación lógica propuesta, no un endpoint implementado ni una garantía sobre el backend.
7. Guardar filtros no sensibles en URL. Ubicación precisa, mensajes privados, datos de cobro y tokens no deben ir a URLs de retorno o telemetría.
8. Invitaciones: validar token temporal, destinatario y aceptación. No conceder acceso por visitar el enlace.
9. Los nombres de guardas son conceptos del contrato; deben mapearse a permisos del backend y RLS al implementar.
10. La creación y la edición reutilizan formularios pero tienen IDs y comandos diferentes: editar no crea otro negocio o evento.

## Navegación global

App: Inicio → `home`; Explorar → `explore`; Mapa → `map`; Organizar → `private.list`; Perfil → `account`. Cabecera: Favoritos y Notificaciones.

Desde Mi cuenta: Mis negocios → `business.list`; Mis eventos publicados → `publication.list`. Las capacidades conviven en una cuenta. Administración usa shell propio y permisos específicos, no un plan de pago.

## Resolver origen y vuelta

| Contexto | Volver / cancelar | Conservar |
| --- | --- | --- |
| Ficha de evento/proveedor | Origen interno válido; si falta, su listado | Filtros, zona de búsqueda y scroll |
| Evento privado | `private.detail` o `private.list` | ID y permisos vigentes |
| Equipo / invitación nueva | Equipo del evento | Invitaciones pendientes no son miembros |
| Cotizaciones | Listado del mismo evento | Evento, solicitud y propuesta autorizados |
| Formulario sin guardar | Quedarse, descartar o guardar borrador si está permitido | Borrador privado protegido |
| Confirmación | Cerrar modal o volver al detalle | No ejecutar comando |
| Comprobante enviado | Estado del pago o facturación | orderId, paymentId y periodo; no reenviar |
| Modal administrativo | Detalle revalidado | Versión, motivo y permisos actuales |

Una notificación contiene tipo de destino e IDs validados, no una URL arbitraria que se abra ciegamente. El contrato enumera destinos permitidos.

## Reglas de publicación y cobro

S/ 30 por negocio al mes y S/ 100 por evento público al mes; renovación manual. Importe y periodo se resuelven en servidor. Si los canales de cobro no están configurados, no habilitar instrucciones reales de pago.

Contenido aprobado + pago del periodo verificado + vigencia válida permiten visibilidad. Un comprobante recibido no confirma pago. Aprobar contenido no verifica el cobro. El evento finalizado deja de estar en la cartelera activa.

## Catálogo de rutas

| ID | URL propuesta | Acceso | Pantallas / estado |
| --- | --- | --- | --- |
| `home` | `/` | `PUBLIC` | mobile.home (default); desktop.home (default) |
| `explore` | `/explorar` | `PUBLIC` | mobile.explore (default); desktop.explore (default) |
| `map` | `/mapa` | `PUBLIC` | mobile.map (default); mobile.filters (panel_filters); mobile.location (panel_location); mobile.supplierMap (selected_provider); mobile.providerFilters (provider_filters); desktop.map (default) |
| `provider.list` | `/proveedores` | `PUBLIC` | mobile.providers (default) |
| `provider.detail` | `/proveedores/:businessId` | `PUBLIC_VISIBLE` | mobile.supplier (default) |
| `event.public` | `/eventos/:publicEventId` | `PUBLIC_VISIBLE` | mobile.event (default) |
| `auth.login` | `/acceder` | `GUEST_OR_SESSION` | mobile.login (default) |
| `auth.register` | `/registro` | `GUEST_OR_SESSION` | mobile.register (default) |
| `auth.recovery` | `/recuperar-acceso` | `PUBLIC` | Pendiente de diseñar |
| `auth.reset` | `/restablecer-acceso` | `RECOVERY_SESSION` | Pendiente de diseñar |
| `auth.callback` | `/auth/callback` | `AUTH_CALLBACK` | Pendiente de diseñar |
| `account` | `/cuenta` | `AUTH` | mobile.profile (default); desktop.account (default) |
| `favorites` | `/favoritos` | `AUTH` | mobile.favorites (default); desktop.favorites (default) |
| `notifications` | `/notificaciones` | `AUTH` | mobile.notifications (default); desktop.notifications (default) |
| `private.list` | `/mis-eventos` | `AUTH` | mobile.organize (default) |
| `private.create` | `/mis-eventos/nuevo` | `AUTH` | mobile.create (default) |
| `private.detail` | `/mis-eventos/:privateEventId` | `EVENT_MEMBER` | mobile.budget (default); desktop.planner (default) |
| `private.team` | `/mis-eventos/:privateEventId/equipo` | `EVENT_MEMBER` | mobile.team (default); mobile.pending (invitation_pending); desktop.team (default) |
| `private.invite` | `/mis-eventos/:privateEventId/invitaciones/nueva` | `EVENT_OWNER` | mobile.invite (default) |
| `invite.accept` | `/invitaciones/:inviteToken` | `INVITE_RECIPIENT` | mobile.accept (default) |
| `quote.list` | `/mis-eventos/:privateEventId/cotizaciones` | `EVENT_MEMBER` | mobile.quotes (default) |
| `quote.create` | `/mis-eventos/:privateEventId/solicitudes/nueva` | `EVENT_MEMBER` | mobile.quote (default) |
| `quote.request` | `/mis-eventos/:privateEventId/solicitudes/:requestId` | `EVENT_MEMBER` | mobile.sent (request_pending) |
| `quote.compare` | `/mis-eventos/:privateEventId/propuestas/comparar` | `EVENT_MEMBER` | mobile.compare (default); desktop.compare (default) |
| `quote.detail` | `/mis-eventos/:privateEventId/propuestas/:proposalId` | `EVENT_MEMBER` | mobile.clientProposal (default); mobile.clientSelectConfirm (modal_select); mobile.clientSelected (selected) |
| `business.list` | `/cuenta/negocios` | `AUTH` | mobile.businesses (default); desktop.businesses (default) |
| `business.create` | `/cuenta/negocios/nuevo` | `AUTH` | mobile.businessCreate (default); desktop.businessCreate (default) |
| `business.detail` | `/cuenta/negocios/:businessId` | `BUSINESS_MEMBER` | mobile.businessDetail (default); mobile.businessPending (content_pending); mobile.businessPublished (published); mobile.businessChanges (content_observed) |
| `business.review` | `/cuenta/negocios/:businessId/revisar` | `BUSINESS_EDITOR` | mobile.businessReview (default); desktop.businessReview (default) |
| `business.services` | `/cuenta/negocios/:businessId/servicios` | `BUSINESS_MEMBER` | mobile.services (default) |
| `business.serviceNew` | `/cuenta/negocios/:businessId/servicios/nuevo` | `BUSINESS_EDITOR` | mobile.serviceEdit (create_reuses_service_form) |
| `business.serviceEdit` | `/cuenta/negocios/:businessId/servicios/:serviceId/editar` | `BUSINESS_EDITOR` | mobile.serviceEdit (default) |
| `business.requests` | `/cuenta/negocios/:businessId/solicitudes` | `BUSINESS_MEMBER` | mobile.requests (default); mobile.responded (filter_responded); desktop.requests (default) |
| `business.request` | `/cuenta/negocios/:businessId/solicitudes/:requestId` | `BUSINESS_MEMBER` | mobile.requestDetail (default); mobile.replySent (proposal_sent); mobile.decline (modal_decline); mobile.declineSent (declined); desktop.replySent (proposal_sent) |
| `business.reply` | `/cuenta/negocios/:businessId/solicitudes/:requestId/respuesta` | `BUSINESS_EDITOR` | mobile.reply (default); desktop.reply (default) |
| `business.replyReview` | `/cuenta/negocios/:businessId/solicitudes/:requestId/respuesta/revisar` | `BUSINESS_EDITOR` | mobile.replyReview (default); desktop.replyConfirm (default) |
| `business.plan` | `/cuenta/negocios/:businessId/plan` | `BUSINESS_BILLING` | mobile.businessPlan (default) |
| `business.checkout` | `/cuenta/negocios/:businessId/pagos/nuevo` | `BUSINESS_BILLING` | mobile.businessPayment (default); desktop.businessPayment (default) |
| `business.payment` | `/cuenta/negocios/:businessId/pagos/:paymentId` | `BUSINESS_BILLING` | mobile.businessReceipt (proof_received); mobile.businessPaymentIssue (payment_observed); desktop.businessReceipt (proof_received) |
| `business.billing` | `/cuenta/negocios/:businessId/facturacion` | `BUSINESS_BILLING` | mobile.businessBilling (default) |
| `business.paymentInfo` | `/cuenta/negocios/:businessId/pagos/instrucciones` | `BUSINESS_BILLING` | mobile.businessPayInfo (default) |
| `publication.list` | `/cuenta/publicaciones` | `AUTH` | mobile.publications (default); desktop.business (default) |
| `publication.create` | `/cuenta/publicaciones/nueva` | `AUTH` | mobile.publish (default); desktop.eventCreate (default) |
| `publication.detail` | `/cuenta/publicaciones/:publicEventId` | `PUBLICATION_OWNER` | mobile.publicationDetail (default); mobile.eventPending (content_pending); mobile.eventPublished (published); mobile.eventChanges (content_observed) |
| `publication.edit` | `/cuenta/publicaciones/:publicEventId/editar` | `PUBLICATION_OWNER` | mobile.publish (edit_reuses_create_form) |
| `publication.details` | `/cuenta/publicaciones/:publicEventId/editar/detalles` | `PUBLICATION_OWNER` | mobile.eventDetails (default) |
| `publication.review` | `/cuenta/publicaciones/:publicEventId/revisar` | `PUBLICATION_OWNER` | mobile.review (default); desktop.eventReview (default) |
| `publication.plan` | `/cuenta/publicaciones/:publicEventId/plan` | `PUBLICATION_OWNER` | mobile.eventPlan (default) |
| `publication.checkout` | `/cuenta/publicaciones/:publicEventId/pagos/nuevo` | `PUBLICATION_OWNER` | mobile.eventPayment (default); desktop.eventPayment (default) |
| `publication.payment` | `/cuenta/publicaciones/:publicEventId/pagos/:paymentId` | `PUBLICATION_OWNER` | mobile.eventReceipt (proof_received); mobile.eventPaymentIssue (payment_observed); desktop.eventReceipt (proof_received) |
| `publication.billing` | `/cuenta/publicaciones/:publicEventId/facturacion` | `PUBLICATION_OWNER` | mobile.eventBilling (default) |
| `publication.paymentInfo` | `/cuenta/publicaciones/:publicEventId/pagos/instrucciones` | `PUBLICATION_OWNER` | mobile.eventPayInfo (default) |
| `admin.home` | `/admin` | `ADMIN` | admin.dashboard (default) |
| `admin.events` | `/admin/eventos` | `ADMIN_EVENT_REVIEW` | admin.events (default) |
| `admin.event` | `/admin/eventos/:publicEventId` | `ADMIN_EVENT_REVIEW` | admin.eventReview (default); admin.eventApprove (modal_approve); admin.eventApproved (published); admin.decisionRecorded (decision_recorded) |
| `admin.eventDecision` | `/admin/eventos/:publicEventId/decision` | `ADMIN_EVENT_REVIEW` | admin.eventObservation (default) |
| `admin.businesses` | `/admin/negocios` | `ADMIN_BUSINESS_REVIEW` | admin.businesses (default) |
| `admin.business` | `/admin/negocios/:businessId` | `ADMIN_BUSINESS_REVIEW` | admin.businessReview (default); admin.businessApprove (modal_approve); admin.businessApproved (published); admin.decisionRecorded (decision_recorded) |
| `admin.businessDecision` | `/admin/negocios/:businessId/decision` | `ADMIN_BUSINESS_REVIEW` | admin.businessObservation (default) |
| `admin.payments` | `/admin/pagos` | `ADMIN_PAYMENT_VERIFY` | admin.payments (default) |
| `admin.payment` | `/admin/pagos/:paymentId` | `ADMIN_PAYMENT_VERIFY` | admin.eventPaymentReview (event_payment); admin.eventPaymentConfirm (modal_verify_event); admin.eventPaymentVerified (payment_verified); admin.businessPaymentReview (business_payment); admin.businessPaymentConfirm (modal_verify_business); admin.businessPaymentVerified (payment_verified); admin.decisionRecorded (decision_recorded) |
| `admin.paymentObservation` | `/admin/pagos/:paymentId/observacion` | `ADMIN_PAYMENT_VERIFY` | admin.paymentObservation (default) |
| `admin.subscriptions` | `/admin/suscripciones` | `ADMIN_SUBSCRIPTION` | admin.subscriptions (default) |
| `admin.subscription` | `/admin/suscripciones/:subscriptionId` | `ADMIN_SUBSCRIPTION` | admin.subscriptionDetail (default) |
| `admin.users` | `/admin/usuarios` | `ADMIN_USER_MANAGE` | admin.users (default) |
| `admin.user` | `/admin/usuarios/:userId` | `ADMIN_USER_MANAGE` | admin.userDetail (default); admin.suspendConfirm (modal_suspend); admin.suspended (suspended) |
| `admin.reports` | `/admin/reportes` | `ADMIN_REPORT_MANAGE` | admin.reports (default) |
| `admin.report` | `/admin/reportes/:reportId` | `ADMIN_REPORT_MANAGE` | admin.reportDetail (default); admin.decisionRecorded (decision_recorded) |
| `admin.reportResolve` | `/admin/reportes/:reportId/resolver` | `ADMIN_REPORT_MANAGE` | admin.reportDecision (default) |
| `admin.audit` | `/admin/actividad` | `ADMIN_AUDIT_READ` | admin.audit (default) |
| `admin.settings` | `/admin/configuracion/publicaciones` | `ADMIN_CONFIG_MANAGE` | admin.settings (default) |
| `business.edit` | `/cuenta/negocios/:businessId/editar` | `BUSINESS_EDITOR` | mobile.businessCreate (edit_reuses_create_form) |

## Transiciones

| ID | Origen | Acción | Destino | Comando / condición |
| --- | --- | --- | --- | --- |
| T001 | `*app` | Inicio | `home` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T002 | `*app` | Explorar | `explore` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T003 | `*app` | Mapa | `map` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T004 | `*app` | Organizar | `private.list` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T005 | `*app` | Perfil | `account` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T006 | `*app` | Favoritos de cabecera | `favorites` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T007 | `*app` | Notificaciones | `notifications` | Si la ruta requiere sesión, pasar por auth.login con retorno interno seguro. · historial: push |
| T008 | `explore` | Abrir evento | `event.public` | Solo publicación pública vigente; mantener filtros para volver. · historial: push |
| T009 | `map` | Abrir evento seleccionado | `event.public` | El resultado es público; conservar zona y filtros. · historial: push |
| T010 | `map` | Abrir proveedor seleccionado | `provider.detail` | El negocio es público; no asumir disponibilidad. · historial: push |
| T011 | `map` | Abrir filtros o ubicación | `map` | Cambiar query.panel; coordenadas precisas solo en memoria. · historial: push · vista: panel_filters|panel_location |
| T012 | `map` | Aplicar filtros / seleccionar resultado | `map` | Actualizar solo filtros no sensibles y selección por ID. · historial: replace |
| T013 | `provider.list` | Abrir proveedor | `provider.detail` | Acceso autorizado al recurso. · historial: push |
| T014 | `provider.detail` | Solicitar cotización sin evento elegido | `private.list` | Exigir sesión y seleccionar un evento autorizado; conservar businessId como intención. · historial: push |
| T015 | `private.list` | Elegir evento para la solicitud | `quote.create` | privateEventId elegido y businessId de la intención, ambos válidos. · historial: push |
| T016 | `event.public` | Consultar entradas por WhatsApp | Salida externa: whatsapp | Teléfono del organizador validado; enlace wa.me sin datos privados. · historial: external |
| T017 | `event.public` | Cómo llegar | Salida externa: maps | Solo coordenadas o dirección pública verificadas. · historial: external |
| T018 | `auth.login` | Entrar | `account` | `auth.signIn` · Solo tras obtener una sesión válida. · historial: replace |
| T019 | `auth.login` | Crear cuenta | `auth.register` | Conservar intención interna segura. · historial: push |
| T020 | `auth.login` | Olvidé mi contraseña | `auth.recovery` | Estado de recuperación pendiente de diseño. · historial: push |
| T021 | `auth.register` | Completar registro | `account` | `auth.register` · Con sesión válida. Si requiere confirmar correo, mostrar estado pendiente. · historial: replace |
| T022 | `auth.recovery` | Enviar recuperación | `auth.recovery` | `auth.requestRecovery` · Respuesta neutral para evitar revelar si existe la cuenta. · historial: replace · vista: recovery_requested |
| T023 | `auth.reset` | Guardar nueva contraseña | `auth.login` | `auth.resetPassword` · Recuperación válida; no confundir token con sesión completa. · historial: replace |
| T024 | `auth.callback` | Completar autenticación | `account` | Validar retorno del proveedor y sesión; limpiar parámetros sensibles. · historial: replace |
| T025 | `account` | Mis negocios | `business.list` | Acceso autorizado al recurso. · historial: push |
| T026 | `account` | Mis eventos publicados | `publication.list` | Acceso autorizado al recurso. · historial: push |
| T027 | `private.list` | Crear evento privado | `private.create` | Acceso autorizado al recurso. · historial: push |
| T028 | `private.list` | Abrir evento privado | `private.detail` | Propietario o coorganizador aceptado. · historial: push |
| T029 | `private.create` | Continuar al presupuesto | `private.detail` | `privateEvent.create` · Validar datos y esperar creación persistida; usar ID devuelto. · historial: replace |
| T030 | `private.detail` | Compartir | `private.team` | Acceso autorizado al recurso. · historial: push |
| T031 | `private.team` | Invitar a una amistad | `private.invite` | Solo propietario. · historial: push |
| T032 | `private.invite` | Enviar invitación | `private.team` | `invitation.create` · Validar destinatario y alcance; no dar membresía todavía. · historial: replace · vista: invitation_pending |
| T033 | `private.invite` | Copiar enlace | `private.invite` | `invitation.createLink` · Token temporal y revocable generado de forma segura; no registrar token en telemetría. · historial: stay |
| T034 | `invite.accept` | Aceptar | `private.detail` | `invitation.accept` · Sesión, destinatario y token vigentes; solo tras aceptación persistida. · historial: replace |
| T035 | `invite.accept` | Ahora no | `notifications` | No conceder acceso. · historial: replace |
| T036 | `private.detail` | Buscar proveedores | `provider.list` | Preservar contexto del evento, sin publicarlo. · historial: push |
| T037 | `private.detail` | Ver cotizaciones | `quote.list` | Acceso autorizado al recurso. · historial: push |
| T038 | `quote.create` | Enviar solicitud | `quote.request` | `quoteRequest.create` · Revalidar acceso al evento y negocio; usar requestId de respuesta. · historial: replace · vista: request_pending |
| T039 | `quote.list` | Ver detalle de propuesta | `quote.detail` | La propuesta pertenece al mismo evento autorizado. · historial: push |
| T040 | `quote.list` | Comparar propuestas | `quote.compare` | Solo propuestas del mismo evento; no confiar en query.ids. · historial: push |
| T041 | `quote.detail` | Seleccionar esta propuesta | `quote.detail` | Propuesta vigente y visible para el equipo. · historial: push · vista: modal_select |
| T042 | `quote.detail` | Confirmar selección | `quote.detail` | `proposal.select` · Esperar escritura exitosa y revalidar vigencia; no hacer cobro ni contrato. · historial: replace · vista: selected |
| T043 | `quote.compare` | Ver condiciones | `quote.detail` | Acceso autorizado al recurso. · historial: push |
| T044 | `business.list` | Crear negocio | `business.create` | Acceso autorizado al recurso. · historial: push |
| T045 | `business.list` | Gestionar negocio | `business.detail` | Membresía del negocio consultada en servidor. · historial: push |
| T046 | `business.create` | Revisar mi negocio | `business.review` | `business.saveDraft` · Validar y crear borrador persistido; usar businessId devuelto. · historial: replace |
| T047 | `business.detail` | Editar ficha | `business.edit` | Reutilizar formulario en modo edición con businessId autorizado. · historial: push |
| T048 | `business.review` | Continuar al plan | `business.plan` | La vista previa proviene del borrador guardado. · historial: push |
| T049 | `business.detail` | Ver servicios | `business.services` | Acceso autorizado al recurso. · historial: push |
| T050 | `business.services` | Añadir servicio | `business.serviceNew` | Acceso autorizado al recurso. · historial: push |
| T051 | `business.services` | Editar servicio | `business.serviceEdit` | serviceId pertenece al negocio. · historial: push |
| T052 | `business.serviceNew` | Guardar servicio | `business.services` | `service.create` · Validar y persistir; no publicar si el negocio no tiene vigencia. · historial: replace |
| T053 | `business.serviceEdit` | Guardar cambios | `business.services` | `service.update` · Servicio y permiso de edición actuales. · historial: replace |
| T054 | `business.detail` | Ver solicitudes | `business.requests` | Acceso autorizado al recurso. · historial: push |
| T055 | `business.requests` | Abrir solicitud | `business.request` | La solicitud se dirige al negocio autorizado. · historial: push |
| T056 | `business.request` | Preparar propuesta | `business.reply` | Solicitud aún admite una respuesta. · historial: push |
| T057 | `business.reply` | Revisar propuesta | `business.replyReview` | `proposal.saveDraft` · Guardar borrador con alcance, importe, vigencia y condiciones. · historial: push |
| T058 | `business.replyReview` | Enviar propuesta | `business.request` | `proposal.send` · Confirmar intención y esperar respuesta persistida. · historial: replace · vista: proposal_sent |
| T059 | `business.request` | No puedo atender | `business.request` | Abrir confirmación, sin cambiar estado aún. · historial: push · vista: modal_decline |
| T060 | `business.request` | Confirmar que no puede atender | `business.request` | `quoteRequest.decline` · Registrar motivo y respuesta solo si la operación se completa. · historial: replace · vista: declined |
| T061 | `business.requests` | Ver respondidas | `business.requests` | Query.estado filtra; no cambia el estado de solicitudes. · historial: replace · vista: filter_responded |
| T062 | `publication.list` | Crear evento público | `publication.create` | Acceso autorizado al recurso. · historial: push |
| T063 | `publication.list` | Gestionar o retomar borrador | `publication.detail` | Responsable autorizado, incluso cuando la ficha aún no es pública. · historial: push |
| T064 | `publication.create` | Continuar a detalles | `publication.details` | `publicEvent.saveDraft` · Guardar borrador y usar publicEventId devuelto. · historial: replace |
| T065 | `publication.details` | Revisar mi evento | `publication.review` | `publicEvent.saveDetails` · Datos y fotos válidos; fecha final coherente. · historial: push |
| T066 | `publication.detail` | Editar información | `publication.edit` | Responsable y estado permiten editar. · historial: push |
| T067 | `publication.edit` | Continuar | `publication.details` | `publicEvent.updateDraft` · Actualizar el mismo publicEventId, no crear otra publicación. · historial: push |
| T068 | `publication.review` | Continuar al plan | `publication.plan` | Acceso autorizado al recurso. · historial: push |
| T069 | `publication.detail` | Ver mi publicación | `event.public` | Solo si es pública; si no, usar vista previa privada. · historial: push |
| T070 | `business.plan` | Continuar al pago | `business.checkout` | `publicationOrder.prepare` · Plan e importe resueltos en servidor; no tomarlos de query. · historial: push |
| T071 | `business.checkout` | Consultar datos de pago | `business.paymentInfo` | Solo mostrar datos de cobro válidos; si faltan, impedir instrucción de pago. · historial: push |
| T072 | `business.checkout` | Enviar comprobante | `business.payment` | `paymentProof.submit` · Esperar carga y registro; conservar referencia al periodo y al recurso. · historial: replace · vista: proof_received |
| T073 | `business.detail` | Ver plan y pagos | `business.billing` | Acceso autorizado al recurso. · historial: push |
| T074 | `business.billing` | Renovar periodo | `business.checkout` | `publicationOrder.prepareRenewal` · Renovación manual; evento finalizado no se renueva como activo. · historial: push |
| T075 | `business.billing` | Ver historial | `business.payment` | paymentId pertenece al recurso y a un periodo real. · historial: push |
| T076 | `business.payment` | Corregir comprobante | `business.checkout` | Pago observado; conservar paymentId/orderId para corregir sin duplicar cobros. · historial: push |
| T077 | `business.payment` | Volver a publicación | `business.detail` | Volver al estado real del recurso; no derivar publicación desde la URL. · historial: push |
| T078 | `publication.plan` | Continuar al pago | `publication.checkout` | `publicationOrder.prepare` · Plan e importe resueltos en servidor; no tomarlos de query. · historial: push |
| T079 | `publication.checkout` | Consultar datos de pago | `publication.paymentInfo` | Solo mostrar datos de cobro válidos; si faltan, impedir instrucción de pago. · historial: push |
| T080 | `publication.checkout` | Enviar comprobante | `publication.payment` | `paymentProof.submit` · Esperar carga y registro; conservar referencia al periodo y al recurso. · historial: replace · vista: proof_received |
| T081 | `publication.detail` | Ver plan y pagos | `publication.billing` | Acceso autorizado al recurso. · historial: push |
| T082 | `publication.billing` | Renovar periodo | `publication.checkout` | `publicationOrder.prepareRenewal` · Renovación manual; evento finalizado no se renueva como activo. · historial: push |
| T083 | `publication.billing` | Ver historial | `publication.payment` | paymentId pertenece al recurso y a un periodo real. · historial: push |
| T084 | `publication.payment` | Corregir comprobante | `publication.checkout` | Pago observado; conservar paymentId/orderId para corregir sin duplicar cobros. · historial: push |
| T085 | `publication.payment` | Volver a publicación | `publication.detail` | Volver al estado real del recurso; no derivar publicación desde la URL. · historial: push |
| T086 | `*admin` | Abrir home | `admin.home` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T087 | `*admin` | Abrir events | `admin.events` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T088 | `*admin` | Abrir businesses | `admin.businesses` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T089 | `*admin` | Abrir payments | `admin.payments` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T090 | `*admin` | Abrir subscriptions | `admin.subscriptions` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T091 | `*admin` | Abrir users | `admin.users` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T092 | `*admin` | Abrir reports | `admin.reports` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T093 | `*admin` | Abrir audit | `admin.audit` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T094 | `*admin` | Abrir settings | `admin.settings` | Requiere la capacidad administrativa específica del destino. · historial: push |
| T095 | `admin.events` | Revisar evento | `admin.event` | Acceso autorizado al recurso. · historial: push |
| T096 | `admin.businesses` | Revisar negocio | `admin.business` | Acceso autorizado al recurso. · historial: push |
| T097 | `admin.event` | Aprobar contenido | `admin.event` | Mostrar confirmación y revisar la versión actual del recurso. · historial: push · vista: modal_approve |
| T098 | `admin.event` | Confirmar y publicar | `admin.event` | `moderation.approveContent` · Aprobar contenido y recalcular visibilidad en servidor; pago y vigencia deben ser válidos. · historial: replace · vista: published_or_waiting_payment |
| T099 | `admin.event` | Solicitar cambios o rechazar | `admin.eventDecision` | No ejecutar la decisión al abrir el formulario. · historial: push |
| T100 | `admin.eventDecision` | Confirmar decisión | `admin.event` | `moderation.recordDecision` · Validar decisión, motivo, permiso y versión; auditar antes/después. · historial: replace · vista: observed_or_rejected |
| T101 | `admin.business` | Aprobar contenido | `admin.business` | Mostrar confirmación y revisar la versión actual del recurso. · historial: push · vista: modal_approve |
| T102 | `admin.business` | Confirmar y publicar | `admin.business` | `moderation.approveContent` · Aprobar contenido y recalcular visibilidad en servidor; pago y vigencia deben ser válidos. · historial: replace · vista: published_or_waiting_payment |
| T103 | `admin.business` | Solicitar cambios o rechazar | `admin.businessDecision` | No ejecutar la decisión al abrir el formulario. · historial: push |
| T104 | `admin.businessDecision` | Confirmar decisión | `admin.business` | `moderation.recordDecision` · Validar decisión, motivo, permiso y versión; auditar antes/después. · historial: replace · vista: observed_or_rejected |
| T105 | `admin.payments` | Revisar comprobante | `admin.payment` | Cargar recurso y periodo desde paymentId; no desde el texto de un botón. · historial: push |
| T106 | `admin.payment` | Continuar a verificación | `admin.payment` | Abrir confirmación tras cotejar referencia e importe. · historial: push · vista: modal_verify |
| T107 | `admin.payment` | Confirmar pago verificado | `admin.payment` | `payment.verify` · Verificar contra registro real, evitar duplicados, auditar y recalcular visibilidad. · historial: replace · vista: payment_verified |
| T108 | `admin.payment` | Solicitar corrección | `admin.paymentObservation` | Acceso autorizado al recurso. · historial: push |
| T109 | `admin.paymentObservation` | Registrar observación | `admin.payment` | `payment.observe` · Motivo requerido; no alterar aprobación del contenido. · historial: replace · vista: payment_observed |
| T110 | `admin.subscriptions` | Revisar periodo | `admin.subscription` | Acceso autorizado al recurso. · historial: push |
| T111 | `admin.subscription` | Revisar pago del periodo | `admin.payment` | Acceso autorizado al recurso. · historial: push |
| T112 | `admin.users` | Abrir cuenta | `admin.user` | Acceso autorizado al recurso. · historial: push |
| T113 | `admin.user` | Revisar suspensión | `admin.user` | Mostrar confirmación con usuario y efecto; aún no suspender. · historial: push · vista: modal_suspend |
| T114 | `admin.user` | Confirmar suspensión con motivo | `admin.user` | `account.suspend` · Permiso específico, motivo y revalidación; no eliminar datos. · historial: replace · vista: suspended |
| T115 | `admin.reports` | Abrir reporte | `admin.report` | Acceso autorizado al recurso. · historial: push |
| T116 | `admin.report` | Ver publicación | `admin.event` | Resolver tipo e ID desde el reporte; si es negocio, usar admin.business. · historial: push |
| T117 | `admin.report` | Resolver con motivo | `admin.reportResolve` | Acceso autorizado al recurso. · historial: push |
| T118 | `admin.reportResolve` | Confirmar resolución | `admin.report` | `report.resolve` · Auditar decisión; si requiere suspender, confirmar recurso y efecto explícitamente. · historial: replace · vista: resolved |
| T119 | `business.edit` | Guardar y revisar | `business.review` | `business.updateDraft` · Actualizar el mismo businessId; nunca crear otro perfil. · historial: push |

## Pendientes de diseño

- **G01 · Recuperación, restablecimiento y callback** (sin frame de producto): Diseñar respuesta neutral, token inválido y retorno de autenticación. No mostrar sesión activa sin validación.
- **G02 · Acceso denegado y recurso inexistente** (estado común pendiente): 403 genérico en áreas privadas; 404 genérico para datos no públicos. No filtrar nombres, dirección o membresías.
- **G03 · Invitación vencida, revocada o de otra cuenta** (variantes pendientes): No dar acceso; permitir entrar con la cuenta correcta o solicitar una nueva invitación.
- **G04 · Cambios sin guardar y sesión expirada** (confirmación común pendiente): Ofrecer quedarse, descartar o guardar borrador si corresponde; tras login restaurar intención, nunca reenviar automáticamente.
- **G05 · Propuesta vencida o solicitud cerrada** (variantes pendientes): Deshabilitar seleccionar/enviar; recargar estado y volver a comparar o a la solicitud.
- **G06 · Comprobante duplicado y archivo rechazado** (errores de formulario pendientes): Conservar datos; explicar corrección; no crear otro cobro ni periodo cuando se reintenta.
- **G07 · Estado de evento finalizado en enlace directo** (variante pública pendiente): Excluir de cartelera activa; mostrar no disponible/finalizado sin reserva. Confirmar el diseño antes de habilitar histórico público.
- **G08 · Permiso de ubicación denegado o no disponible** (variante pendiente): Mantener búsqueda manual; no bloquear explorar ni exponer coordenadas precisas en URL o telemetría.
- **G09 · Catálogos y bandejas vacíos / sin conexión** (reutilizar estados existentes con copy adaptado): Los estados de referencia del archivo no cubren cada módulo; separar carga, vacío, error y acceso denegado.

Estos pendientes son estados y recorridos que deben diseñarse o adaptarse antes de cerrar la implementación; no están resueltos por dibujar una flecha.

## Controles del prototipo sin interacción conectada

Son una lista de revisión, no necesariamente errores: algunos requieren integración real o estado de filtros, y otros son atajos incompletos del prototipo. Implementarlos según el contrato, no copiando el salto de una pantalla de ejemplo.

- Detalle de evento · Mobile · **Consultar cómo llegar** · Figma 6:145
- Detalle de evento · Mobile · **Consultar entradas por WhatsApp** · Figma 6:145
- Crear cuenta · Mobile · **Crear mi cuenta** · Figma 11:619
- Zona de búsqueda · Mobile · **Usar mi ubicación** · Figma 32:903
- Invitar a una amistad · Mobile · **Copiar enlace de invitación** · Figma 33:935
- Explorar · Desktop · **Aplicar filtros** · Figma 9:110
- Planificación · Desktop · **Añadir servicio** · Figma 9:215
- Planificación · Desktop · **Buscar proveedores** · Figma 9:215
- Negocio · Publicaciones · Desktop · **Publicar evento** · Figma 9:299
- Comparar cotizaciones · Desktop · **Ver condiciones** · Figma 12:253
- Comparar cotizaciones · Desktop · **Ver condiciones** · Figma 12:253
- Mapa · Desktop · **Publicar evento** · Figma 34:242
- Mapa · Desktop · **Aplicar filtros** · Figma 34:242
- Equipo del evento · Desktop · **Publicar evento** · Figma 34:331
- Equipo del evento · Desktop · **Preparar invitación** · Figma 34:331
- Equipo del evento · Desktop · **Copiar enlace privado** · Figma 34:331
- Favoritos · Desktop · **Publicar evento** · Figma 34:385
- Solicitudes del negocio · Desktop · **Ver solicitud** · Figma 52:420
- Solicitudes del negocio · Desktop · **Ver solicitud** · Figma 52:420

## Criterios de verificación

- Cada enlace directo carga solo datos autorizados; probar visitante, propietario, coorganizador, negocio ajeno y administrador sin la capacidad requerida.
- Cada confirmación puede cancelarse sin escritura; cada reintento evita duplicados.
- Recargar una URL no vuelve a ejecutar un comando.
- El éxito de envío, pago o publicación requiere confirmación verificable.
- Atrás preserva contexto y filtros, y no expone datos privados.
- Revisar estados de sesión expirada, 403, 404, sin resultados, red interrumpida, invitación inválida, propuesta vencida y conflicto de revisión.
- No confundir una pantalla del prototipo con una prueba de integración.

