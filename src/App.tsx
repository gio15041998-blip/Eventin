import React from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { LiveStoreProvider as DemoStoreProvider } from './repositories/liveStore';
import { AppShell, PlannerWorkspaceShell } from './components/ui/Shells';
import { NotFound404 } from './components/ui/StateBlocks';
import {
  ExplorePage,
  HomePage,
  MapPage,
  ProviderDetailPage,
  ProviderListPage,
  PublicEventDetailPage,
} from './pages/PublicPages';
import {
  AdminSetupPage,
  CallbackPage,
  LoginPage,
  RecoveryPage,
  RegisterPage,
  ResetPage,
} from './pages/AuthPages';
import {
  AccountPage,
  FavoritesPage,
  NotificationsPage,
} from './pages/PersonalPages';
import {
  InviteAcceptPage,
  PrivateCreatePage,
  PrivateDetailPage,
  PrivateInvitePage,
  PrivateListPage,
  PrivateTeamPage,
} from './pages/PrivatePlannerPages';
import {
  QuoteComparePage,
  QuoteCreatePage,
  QuoteDetailPage,
  QuoteListPage,
  QuoteRequestPage,
} from './pages/QuotePages';
import {
  BusinessBillingPage,
  BusinessCheckoutPage,
  BusinessDetailPage,
  BusinessFormPage,
  BusinessListPage,
  BusinessPaymentInfoPage,
  BusinessPaymentPage,
  BusinessPlanPage,
  BusinessReplyPage,
  BusinessReplyReviewPage,
  BusinessRequestDetailPage,
  BusinessRequestsPage,
  BusinessReviewPage,
  BusinessServiceFormPage,
  BusinessServicesPage,
} from './pages/BusinessPages';
import {
  PublicationBillingPage,
  PublicationCheckoutPage,
  PublicationDetailPage,
  PublicationDetailsPage,
  PublicationFormPage,
  PublicationListPage,
  PublicationPaymentInfoPage,
  PublicationPaymentPage,
  PublicationPlanPage,
  PublicationReviewPage,
} from './pages/PublicationPages';
import {
  AdminAuditPage,
  AdminBusinessDecisionPage,
  AdminBusinessDetailPage,
  AdminBusinessesPage,
  AdminEventDecisionPage,
  AdminEventDetailPage,
  AdminEventsPage,
  AdminHomePage,
  AdminPaymentDetailPage,
  AdminPaymentObservationPage,
  AdminPaymentsPage,
  AdminReportDetailPage,
  AdminReportResolvePage,
  AdminReportsPage,
  AdminSettingsPage,
  AdminSubscriptionDetailPage,
  AdminSubscriptionsPage,
  AdminUserDetailPage,
  AdminUsersPage,
} from './pages/AdminPages';

const AppShellLayout: React.FC = () => (
  <AppShell>
    <Outlet />
  </AppShell>
);

export const App: React.FC = () => {
  return (
    <DemoStoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Public, Personal, Quotes, Business & Publication routes inside AppShell */}
          <Route element={<AppShellLayout />}>
            {/* Public (11) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/explorar" element={<ExplorePage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/proveedores" element={<ProviderListPage />} />
            <Route path="/proveedores/:businessId" element={<ProviderDetailPage />} />
            <Route path="/eventos/:publicEventId" element={<PublicEventDetailPage />} />
            <Route path="/acceder" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/recuperar-acceso" element={<RecoveryPage />} />
            <Route path="/restablecer-acceso" element={<ResetPage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />
            <Route path="/configurar-admin" element={<AdminSetupPage />} />

            {/* Personal & Private Planning (9) */}
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />
            <Route path="/notificaciones" element={<NotificationsPage />} />
            <Route path="/mis-eventos" element={<PrivateListPage />} />
            <Route path="/mis-eventos/nuevo" element={<PrivateCreatePage />} />
            <Route
              path="/mis-eventos/:privateEventId/equipo"
              element={<PrivateTeamPage />}
            />
            <Route
              path="/mis-eventos/:privateEventId/invitaciones/nueva"
              element={<PrivateInvitePage />}
            />
            <Route path="/invitaciones/:inviteToken" element={<InviteAcceptPage />} />

            {/* Quotes & Proposals (5) */}
            <Route
              path="/mis-eventos/:privateEventId/cotizaciones"
              element={<QuoteListPage />}
            />
            <Route
              path="/mis-eventos/:privateEventId/solicitudes/nueva"
              element={<QuoteCreatePage />}
            />
            <Route
              path="/mis-eventos/:privateEventId/solicitudes/:requestId"
              element={<QuoteRequestPage />}
            />
            <Route
              path="/mis-eventos/:privateEventId/propuestas/comparar"
              element={<QuoteComparePage />}
            />
            <Route
              path="/mis-eventos/:privateEventId/propuestas/:proposalId"
              element={<QuoteDetailPage />}
            />

            {/* Business & Provider Management (17) — static segments before parameterized */}
            <Route path="/cuenta/negocios" element={<BusinessListPage />} />
            <Route
              path="/cuenta/negocios/nuevo"
              element={<BusinessFormPage mode="create" />}
            />
            <Route path="/cuenta/negocios/:businessId" element={<BusinessDetailPage />} />
            <Route
              path="/cuenta/negocios/:businessId/editar"
              element={<BusinessFormPage mode="edit" />}
            />
            <Route
              path="/cuenta/negocios/:businessId/revisar"
              element={<BusinessReviewPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/servicios"
              element={<BusinessServicesPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/servicios/nuevo"
              element={<BusinessServiceFormPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/servicios/:serviceId/editar"
              element={<BusinessServiceFormPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/solicitudes"
              element={<BusinessRequestsPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/solicitudes/:requestId"
              element={<BusinessRequestDetailPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/solicitudes/:requestId/respuesta"
              element={<BusinessReplyPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/solicitudes/:requestId/respuesta/revisar"
              element={<BusinessReplyReviewPage />}
            />
            <Route path="/cuenta/negocios/:businessId/plan" element={<BusinessPlanPage />} />
            <Route
              path="/cuenta/negocios/:businessId/pagos/nuevo"
              element={<BusinessCheckoutPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/pagos/instrucciones"
              element={<BusinessPaymentInfoPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/pagos/:paymentId"
              element={<BusinessPaymentPage />}
            />
            <Route
              path="/cuenta/negocios/:businessId/facturacion"
              element={<BusinessBillingPage />}
            />

            {/* Public Event Publications (11) — static segments before parameterized */}
            <Route path="/cuenta/publicaciones" element={<PublicationListPage />} />
            <Route
              path="/cuenta/publicaciones/nueva"
              element={<PublicationFormPage mode="create" />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId"
              element={<PublicationDetailPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/editar"
              element={<PublicationFormPage mode="edit" />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/editar/detalles"
              element={<PublicationDetailsPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/revisar"
              element={<PublicationReviewPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/plan"
              element={<PublicationPlanPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/pagos/nuevo"
              element={<PublicationCheckoutPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/pagos/instrucciones"
              element={<PublicationPaymentInfoPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/pagos/:paymentId"
              element={<PublicationPaymentPage />}
            />
            <Route
              path="/cuenta/publicaciones/:publicEventId/facturacion"
              element={<PublicationBillingPage />}
            />

            {/* 404 Fallback inside AppShell */}
            <Route path="*" element={<NotFound404 />} />
          </Route>

          {/* Planner Workspace (Desktop full-height 248px white sidebar, Mobile bottom nav) */}
          <Route
            path="/mis-eventos/:privateEventId"
            element={
              <PlannerWorkspaceShell>
                <PrivateDetailPage />
              </PlannerWorkspaceShell>
            }
          />

          {/* Admin Console (19) — wrapped in AdminShell inside AdminGuard */}
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/eventos" element={<AdminEventsPage />} />
          <Route path="/admin/eventos/:publicEventId" element={<AdminEventDetailPage />} />
          <Route
            path="/admin/eventos/:publicEventId/decision"
            element={<AdminEventDecisionPage />}
          />
          <Route path="/admin/negocios" element={<AdminBusinessesPage />} />
          <Route path="/admin/negocios/:businessId" element={<AdminBusinessDetailPage />} />
          <Route
            path="/admin/negocios/:businessId/decision"
            element={<AdminBusinessDecisionPage />}
          />
          <Route path="/admin/pagos" element={<AdminPaymentsPage />} />
          <Route path="/admin/pagos/:paymentId" element={<AdminPaymentDetailPage />} />
          <Route
            path="/admin/pagos/:paymentId/observacion"
            element={<AdminPaymentObservationPage />}
          />
          <Route path="/admin/suscripciones" element={<AdminSubscriptionsPage />} />
          <Route
            path="/admin/suscripciones/:subscriptionId"
            element={<AdminSubscriptionDetailPage />}
          />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/usuarios/:userId" element={<AdminUserDetailPage />} />
          <Route path="/admin/reportes" element={<AdminReportsPage />} />
          <Route path="/admin/reportes/:reportId" element={<AdminReportDetailPage />} />
          <Route
            path="/admin/reportes/:reportId/resolver"
            element={<AdminReportResolvePage />}
          />
          <Route path="/admin/actividad" element={<AdminAuditPage />} />
          <Route
            path="/admin/configuracion/publicaciones"
            element={<AdminSettingsPage />}
          />
        </Routes>
      </BrowserRouter>
    </DemoStoreProvider>
  );
};

export default App;
