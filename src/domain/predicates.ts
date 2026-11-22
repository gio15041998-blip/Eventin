import type {
  AdminCapability,
  Business,
  EventMembership,
  Invitation,
  NotificationItem,
  Proposal,
  PublicEvent,
  QuoteRequest,
  User,
} from './types';

export const BUSINESS_MONTHLY_PEN = 30;
export const PUBLIC_EVENT_MONTHLY_PEN = 100;

export function formatPen(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Por cotizar';
  }
  if (amount === 0) {
    return 'Gratis';
  }
  return `S/ ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isEventEnded(event: Pick<PublicEvent, 'endsAt'>, now: Date = new Date()): boolean {
  const end = new Date(event.endsAt);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() < now.getTime();
}

export function isPublicEventVisible(
  event: PublicEvent,
  now: Date = new Date()
): boolean {
  return (
    event.contentStatus === 'approved' &&
    event.paymentStatus === 'verified' &&
    event.subscriptionActive &&
    !isEventEnded(event, now)
  );
}

export function isBusinessVisible(business: Business): boolean {
  return (
    business.contentStatus === 'approved' &&
    business.paymentStatus === 'verified' &&
    business.subscriptionActive
  );
}

export function canAccessPrivateEvent(
  privateEventId: string,
  userId: string | null,
  memberships: EventMembership[]
): boolean {
  if (!userId) return false;
  return memberships.some(
    (m) => m.privateEventId === privateEventId && m.userId === userId
  );
}

export function isPrivateEventOwner(
  privateEventId: string,
  userId: string | null,
  memberships: EventMembership[]
): boolean {
  if (!userId) return false;
  return memberships.some(
    (m) =>
      m.privateEventId === privateEventId &&
      m.userId === userId &&
      m.role === 'owner'
  );
}

export type InvitationEvaluation =
  | 'valid'
  | 'expired'
  | 'revoked'
  | 'already_accepted'
  | 'wrong_account'
  | 'not_found';

export function evaluateInvitation(
  invitation: Invitation | undefined,
  currentUser: User | null,
  now: Date = new Date()
): InvitationEvaluation {
  if (!invitation) return 'not_found';
  if (invitation.status === 'revoked') return 'revoked';
  if (invitation.status === 'accepted') return 'already_accepted';
  const exp = new Date(invitation.expiresAt);
  if (invitation.status === 'expired' || (!Number.isNaN(exp.getTime()) && exp.getTime() < now.getTime())) {
    return 'expired';
  }
  if (
    currentUser &&
    invitation.recipientEmail.toLowerCase() !== currentUser.email.toLowerCase()
  ) {
    return 'wrong_account';
  }
  return 'valid';
}

export function isProposalExpired(
  proposal: Pick<Proposal, 'status' | 'expiresAt'>,
  now: Date = new Date()
): boolean {
  if (proposal.status === 'expired') return true;
  const exp = new Date(proposal.expiresAt);
  if (Number.isNaN(exp.getTime())) return false;
  return exp.getTime() < now.getTime();
}

export function isProposalActionable(
  proposal: Proposal,
  request: QuoteRequest | undefined,
  now: Date = new Date()
): boolean {
  if (!request) return false;
  if (request.status === 'closed' || request.status === 'declined') return false;
  if (proposal.status === 'selected' || proposal.status === 'rejected' || proposal.status === 'draft') {
    return false;
  }
  return !isProposalExpired(proposal, now);
}

export function calculatePlanAmountPen(kind: 'business' | 'public_event'): number {
  return kind === 'business' ? BUSINESS_MONTHLY_PEN : PUBLIC_EVENT_MONTHLY_PEN;
}

export function hasAdminCapability(
  user: User | null,
  required: AdminCapability
): boolean {
  if (!user || user.accountStatus === 'suspended') return false;
  return user.adminCapabilities.includes(required);
}

const ALLOWED_INTERNAL_PREFIXES = [
  '/',
  '/explorar',
  '/mapa',
  '/proveedores',
  '/eventos',
  '/cuenta',
  '/favoritos',
  '/notificaciones',
  '/mis-eventos',
  '/invitaciones',
  '/admin',
];

export function isSafeInternalReturnTo(raw: string | null | undefined): string {
  if (!raw) return '/cuenta';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/cuenta';
  if (trimmed.includes('://') || trimmed.includes('\\')) return '/cuenta';
  const pathname = trimmed.split('?')[0].split('#')[0];
  if (pathname === '/acceder' || pathname === '/registro') return '/cuenta';
  const matches = ALLOWED_INTERNAL_PREFIXES.some(
    (prefix) => pathname === prefix || (prefix !== '/' && pathname.startsWith(`${prefix}/`))
  );
  return matches ? trimmed : '/cuenta';
}

export function resolveNotificationPath(item: NotificationItem): string {
  switch (item.kind) {
    case 'invitation':
      return `/invitaciones/${item.targetId}`;
    case 'quote_request':
      return item.secondaryId
        ? `/cuenta/negocios/${item.secondaryId}/solicitudes/${item.targetId}`
        : `/cuenta/negocios`;
    case 'proposal_received':
      return item.secondaryId
        ? `/mis-eventos/${item.secondaryId}/propuestas/${item.targetId}`
        : `/mis-eventos`;
    case 'business_review_result':
      return `/cuenta/negocios/${item.targetId}`;
    case 'event_review_result':
      return `/cuenta/publicaciones/${item.targetId}`;
    case 'business_payment_result':
      return item.secondaryId
        ? `/cuenta/negocios/${item.secondaryId}/pagos/${item.targetId}`
        : `/cuenta/negocios`;
    case 'event_payment_result':
      return item.secondaryId
        ? `/cuenta/publicaciones/${item.secondaryId}/pagos/${item.targetId}`
        : `/cuenta/publicaciones`;
    case 'team_activity':
      return `/mis-eventos/${item.targetId}`;
    case 'report':
      return `/admin/reportes/${item.targetId}`;
    default:
      return '/notificaciones';
  }
}

export function formatShortDate(isoDate: string): string {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? `${isoDate}T12:00:00` : isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
