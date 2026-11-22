export type RoleCapability = 'personal' | 'business' | 'publisher';

export type AdminCapability =
  | 'ADMIN'
  | 'ADMIN_EVENT_REVIEW'
  | 'ADMIN_BUSINESS_REVIEW'
  | 'ADMIN_PAYMENT_VERIFY'
  | 'ADMIN_SUBSCRIPTION'
  | 'ADMIN_USER_MANAGE'
  | 'ADMIN_REPORT_MANAGE'
  | 'ADMIN_AUDIT_READ'
  | 'ADMIN_CONFIG_MANAGE';

export type RouteGuard =
  | 'PUBLIC'
  | 'PUBLIC_VISIBLE'
  | 'GUEST_OR_SESSION'
  | 'RECOVERY_SESSION'
  | 'AUTH_CALLBACK'
  | 'AUTH'
  | 'EVENT_MEMBER'
  | 'EVENT_OWNER'
  | 'INVITE_RECIPIENT'
  | 'BUSINESS_MEMBER'
  | 'BUSINESS_EDITOR'
  | 'BUSINESS_BILLING'
  | 'PUBLICATION_OWNER'
  | AdminCapability;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  capabilities: RoleCapability[];
  adminCapabilities: AdminCapability[];
  accountStatus: 'active' | 'suspended';
  suspensionReason?: string;
}

export interface EventMembership {
  id: string;
  privateEventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'owner' | 'coorganizer';
  joinedAt: string;
}

export interface PrivateEvent {
  id: string;
  title: string;
  celebrationType: string;
  eventDate: string;
  zone: string;
  guestCount: number;
  targetBudgetPen: number;
  notes: string;
  ownerId: string;
  proposedBusinessIds: string[];
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  privateEventId: string;
  category: string;
  title: string;
  providerName?: string;
  estimatedPen: number;
  confirmedPen: number;
  paid: boolean;
  addedBy: string;
}

export interface TaskItem {
  id: string;
  privateEventId: string;
  title: string;
  assigneeName: string;
  dueDate: string;
  done: boolean;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  token: string;
  privateEventId: string;
  privateEventTitle: string;
  invitedByUserId: string;
  invitedByName: string;
  recipientEmail: string;
  recipientName: string;
  role: 'coorganizer';
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export type ContentModerationStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'observed'
  | 'rejected'
  | 'suspended';

export type PaymentVerificationStatus =
  | 'unpaid'
  | 'proof_received'
  | 'observed'
  | 'verified';

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  zone: string;
  coverageZones: string[];
  summary: string;
  description: string;
  startingPricePen: number | null;
  quoteOnly: boolean;
  whatsappPhone: string;
  email: string;
  imageUrl: string;
  availabilityNote: string;
  contentStatus: ContentModerationStatus;
  paymentStatus: PaymentVerificationStatus;
  subscriptionActive: boolean;
  subscriptionPeriodEnd: string;
  observationNote?: string;
  version: number;
  mapX: number;
  mapY: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  pricingMode: 'fixed' | 'quote';
  pricePen: number | null;
  unitLabel: string;
  active: boolean;
}

export type QuoteRequestStatus = 'pending' | 'responded' | 'declined' | 'closed';

export interface QuoteRequest {
  id: string;
  privateEventId: string;
  privateEventTitle: string;
  requesterId: string;
  requesterName: string;
  businessId: string;
  businessName: string;
  serviceId?: string;
  serviceName: string;
  eventDate: string;
  guestCount: number;
  zone: string;
  estimatedBudgetPen: number;
  message: string;
  status: QuoteRequestStatus;
  declineReason?: string;
  createdAt: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'selected' | 'expired' | 'rejected';

export interface Proposal {
  id: string;
  requestId: string;
  privateEventId: string;
  businessId: string;
  businessName: string;
  amountPen: number;
  inclusions: string[];
  exclusions: string[];
  conditions: string;
  expiresAt: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface PublicEvent {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  zone: string;
  address: string;
  startsAt: string;
  endsAt: string;
  entryPricePen: number;
  isFree: boolean;
  whatsappPhone: string;
  organizerName: string;
  summary: string;
  description: string;
  imageUrl: string;
  contentStatus: ContentModerationStatus;
  paymentStatus: PaymentVerificationStatus;
  subscriptionActive: boolean;
  subscriptionPeriodEnd: string;
  observationNote?: string;
  version: number;
  mapX: number;
  mapY: number;
}

export interface Payment {
  id: string;
  orderId: string;
  resourceKind: 'business' | 'public_event';
  resourceId: string;
  resourceTitle: string;
  ownerId: string;
  ownerName: string;
  amountPen: number;
  periodLabel: string;
  channelLabel: string;
  proofReference: string;
  proofFileName: string;
  proofNote: string;
  status: 'proof_received' | 'observed' | 'verified';
  observationReason?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Subscription {
  id: string;
  resourceKind: 'business' | 'public_event';
  resourceId: string;
  resourceTitle: string;
  ownerId: string;
  ownerName: string;
  planAmountPen: number;
  periodStart: string;
  periodEnd: string;
  status: 'active' | 'pending_payment' | 'expired' | 'suspended';
  latestPaymentId?: string;
}

export interface Report {
  id: string;
  resourceKind: 'business' | 'public_event';
  resourceId: string;
  resourceTitle: string;
  reason: string;
  reporterNote: string;
  status: 'open' | 'resolved' | 'dismissed';
  resolutionNote?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  resourceKind: string;
  resourceId: string;
  resourceTitle: string;
  previousState: string;
  newState: string;
  reason: string;
  timestamp: string;
}

export type NotificationKind =
  | 'invitation'
  | 'quote_request'
  | 'proposal_received'
  | 'business_review_result'
  | 'event_review_result'
  | 'business_payment_result'
  | 'event_payment_result'
  | 'team_activity'
  | 'report';

export interface NotificationItem {
  id: string;
  userId: string;
  kind: NotificationKind;
  targetId: string;
  secondaryId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface PlatformSettings {
  businessMonthlyPen: number;
  publicEventMonthlyPen: number;
  beneficiaryConfigured: boolean;
  beneficiaryName: string;
  beneficiaryChannel: string;
  beneficiaryAccount: string;
  beneficiaryNote: string;
}

export interface FavoriteEntry {
  kind: 'event' | 'provider';
  id: string;
}
