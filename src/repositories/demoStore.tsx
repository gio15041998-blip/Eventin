import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEMO_USERS,
  INITIAL_AUDIT,
  INITIAL_BUDGET_ITEMS,
  INITIAL_BUSINESSES,
  INITIAL_FAVORITES,
  INITIAL_INVITATIONS,
  INITIAL_MEMBERSHIPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_PRIVATE_EVENTS,
  INITIAL_PROPOSALS,
  INITIAL_PUBLIC_EVENTS,
  INITIAL_QUOTE_REQUESTS,
  INITIAL_REPORTS,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TASKS,
} from '../data/seed';
import { EVENTIN_MEDIA } from '../data/media';
import {
  calculatePlanAmountPen,
  evaluateInvitation,
  isProposalActionable,
} from '../domain/predicates';
import type {
  AuditEntry,
  BudgetItem,
  Business,
  ContentModerationStatus,
  EventMembership,
  FavoriteEntry,
  Invitation,
  NotificationItem,
  Payment,
  PlatformSettings,
  PrivateEvent,
  Proposal,
  PublicEvent,
  QuoteRequest,
  Report,
  Service,
  Subscription,
  TaskItem,
  User,
} from '../domain/types';

export interface DemoStoreState {
  users: User[];
  currentUserId: string | null;
  publicEvents: PublicEvent[];
  businesses: Business[];
  services: Service[];
  privateEvents: PrivateEvent[];
  memberships: EventMembership[];
  budgetItems: BudgetItem[];
  tasks: TaskItem[];
  invitations: Invitation[];
  quoteRequests: QuoteRequest[];
  proposals: Proposal[];
  payments: Payment[];
  subscriptions: Subscription[];
  reports: Report[];
  auditLog: AuditEntry[];
  notifications: NotificationItem[];
  favorites: FavoriteEntry[];
  settings: PlatformSettings;
}

export interface CommandResult<T = void> {
  ok: boolean;
  error?: string;
  data?: T;
}

type AsyncCommandResult<T = void> = CommandResult<T> | Promise<CommandResult<T>>;

export interface DemoStoreContextValue extends DemoStoreState {
  currentUser: User | null;
  isDemoMode: boolean;
  // Auth & Demo Actor Switcher
  switchDemoUser: (userId: string | null) => void;
  signInDemo: (email: string, password: string) => AsyncCommandResult<User>;
  registerDemo: (name: string, email: string, phone: string, password?: string) => AsyncCommandResult<User>;
  signOutDemo: () => void;
  // Favorites & Notifications
  toggleFavorite: (kind: 'event' | 'provider', id: string) => void;
  isFavorite: (kind: 'event' | 'provider', id: string) => boolean;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  // Private Events, Budget, Checklist, Team & Invitations
  createPrivateEvent: (input: {
    title: string;
    celebrationType: string;
    eventDate: string;
    zone: string;
    guestCount: number;
    targetBudgetPen: number;
    notes: string;
  }) => AsyncCommandResult<PrivateEvent>;
  addProposedBusinessToEvent: (privateEventId: string, businessId: string) => AsyncCommandResult;
  addBudgetItem: (input: {
    privateEventId: string;
    category: string;
    title: string;
    providerName?: string;
    estimatedPen: number;
    confirmedPen?: number;
  }) => AsyncCommandResult<BudgetItem>;
  toggleBudgetItemPaid: (itemId: string) => void;
  addTask: (input: {
    privateEventId: string;
    title: string;
    assigneeName: string;
    dueDate: string;
  }) => AsyncCommandResult<TaskItem>;
  toggleTask: (taskId: string) => void;
  createInvitation: (input: {
    privateEventId: string;
    recipientName: string;
    recipientEmail: string;
  }) => AsyncCommandResult<Invitation>;
  revokeInvitation: (invitationId: string) => AsyncCommandResult;
  acceptInvitation: (token: string) => AsyncCommandResult<{ privateEventId: string }>;
  // Quotes & Proposals (Client & Provider)
  createQuoteRequest: (input: {
    privateEventId: string;
    businessId: string;
    serviceId?: string;
    serviceName: string;
    eventDate: string;
    guestCount: number;
    zone: string;
    estimatedBudgetPen: number;
    message: string;
  }) => AsyncCommandResult<QuoteRequest>;
  saveProposalDraft: (input: {
    requestId: string;
    amountPen: number;
    inclusions: string[];
    exclusions: string[];
    conditions: string;
    expiresAt: string;
  }) => AsyncCommandResult<Proposal>;
  sendProposal: (proposalId: string) => AsyncCommandResult<Proposal>;
  declineQuoteRequest: (requestId: string, reason: string) => AsyncCommandResult;
  selectProposal: (proposalId: string) => AsyncCommandResult<Proposal>;
  // Business Management & Services
  saveBusinessDraft: (input: {
    businessId?: string;
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
    availabilityNote: string;
    submitForReview?: boolean;
  }) => AsyncCommandResult<Business>;
  saveService: (input: {
    businessId: string;
    serviceId?: string;
    name: string;
    description: string;
    pricingMode: 'fixed' | 'quote';
    pricePen: number | null;
    unitLabel: string;
    active: boolean;
  }) => AsyncCommandResult<Service>;
  // Public Event Publications
  savePublicEventDraft: (input: {
    publicEventId?: string;
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
    submitForReview?: boolean;
  }) => AsyncCommandResult<PublicEvent>;
  // Billing & Payment Proofs
  submitPaymentProof: (input: {
    resourceKind: 'business' | 'public_event';
    resourceId: string;
    proofReference: string;
    proofFileName: string;
    proofNote: string;
    correctionPaymentId?: string;
  }) => AsyncCommandResult<Payment>;
  // Admin Actions (with audit log & version safety)
  moderateContent: (input: {
    resourceKind: 'business' | 'public_event';
    resourceId: string;
    decision: 'approved' | 'observed' | 'rejected' | 'suspended';
    reason: string;
  }) => AsyncCommandResult;
  reviewPayment: (input: {
    paymentId: string;
    decision: 'verified' | 'observed';
    reason: string;
  }) => AsyncCommandResult;
  toggleUserSuspension: (input: {
    userId: string;
    suspend: boolean;
    reason: string;
  }) => AsyncCommandResult;
  resolveReport: (input: {
    reportId: string;
    status: 'resolved' | 'dismissed';
    resolutionNote: string;
    suspendResource?: boolean;
  }) => AsyncCommandResult;
  updatePlatformSettings: (next: PlatformSettings) => AsyncCommandResult;
  resetDemoData: () => void;
}

export const DemoStoreContext = createContext<DemoStoreContextValue | null>(null);

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const DemoStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>('usr-giovanny');
  const [publicEvents, setPublicEvents] = useState<PublicEvent[]>(INITIAL_PUBLIC_EVENTS);
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [privateEvents, setPrivateEvents] = useState<PrivateEvent[]>(INITIAL_PRIVATE_EVENTS);
  const [memberships, setMemberships] = useState<EventMembership[]>(INITIAL_MEMBERSHIPS);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(INITIAL_BUDGET_ITEMS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [invitations, setInvitations] = useState<Invitation[]>(INITIAL_INVITATIONS);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(INITIAL_QUOTE_REQUESTS);
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(INITIAL_FAVORITES);
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const appendAudit = useCallback(
    (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
      setAuditLog((prev) => [
        {
          ...entry,
          id: makeId('aud'),
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  const switchDemoUser = useCallback((userId: string | null) => {
    setCurrentUserId(userId);
  }, []);

  const signInDemo = useCallback(
    (email: string, password: string): CommandResult<User> => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: 'Ingresa tu correo y contraseña para continuar.' };
      }
      const existing = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (existing) {
        if (existing.accountStatus === 'suspended') {
          return {
            ok: false,
            error: 'Esta cuenta demo está suspendida temporalmente.',
          };
        }
        setCurrentUserId(existing.id);
        return { ok: true, data: existing };
      }
      const fallbackUser = users[0];
      setCurrentUserId(fallbackUser.id);
      return { ok: true, data: fallbackUser };
    },
    [users]
  );

  const registerDemo = useCallback(
    (name: string, email: string, phone: string): CommandResult<User> => {
      if (!name.trim() || !email.trim()) {
        return { ok: false, error: 'Completa nombre y correo electrónico.' };
      }
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === normalized)) {
        return {
          ok: false,
          error: 'Ya existe una cuenta demo con este correo. Inicia sesión.',
        };
      }
      const newUser: User = {
        id: makeId('usr'),
        name: name.trim(),
        email: normalized,
        phone: phone.trim() || '999000111',
        city: 'Lima, Perú',
        capabilities: ['personal'],
        adminCapabilities: [],
        accountStatus: 'active',
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      return { ok: true, data: newUser };
    },
    [users]
  );

  const signOutDemo = useCallback(() => {
    setCurrentUserId(null);
  }, []);

  const toggleFavorite = useCallback((kind: 'event' | 'provider', id: string) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.kind === kind && f.id === id);
      if (exists) {
        return prev.filter((f) => !(f.kind === kind && f.id === id));
      }
      return [...prev, { kind, id }];
    });
  }, []);

  const isFavorite = useCallback(
    (kind: 'event' | 'provider', id: string) =>
      favorites.some((f) => f.kind === kind && f.id === id),
    [favorites]
  );

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const createPrivateEvent = useCallback(
    (input: {
      title: string;
      celebrationType: string;
      eventDate: string;
      zone: string;
      guestCount: number;
      targetBudgetPen: number;
      notes: string;
    }): CommandResult<PrivateEvent> => {
      if (!currentUser) return { ok: false, error: 'Debes iniciar sesión primero.' };
      if (!input.title.trim()) {
        return { ok: false, error: 'Escribe un nombre para tu celebración.' };
      }
      const newEvent: PrivateEvent = {
        id: makeId('pe'),
        title: input.title.trim(),
        celebrationType: input.celebrationType || 'Celebración',
        eventDate: input.eventDate || '2026-12-28',
        zone: input.zone || 'Miraflores',
        guestCount: Math.max(1, Number(input.guestCount) || 20),
        targetBudgetPen: Math.max(0, Number(input.targetBudgetPen) || 2500),
        notes: input.notes.trim(),
        ownerId: currentUser.id,
        proposedBusinessIds: [],
        createdAt: new Date().toISOString(),
      };
      const ownerMem: EventMembership = {
        id: makeId('mem'),
        privateEventId: newEvent.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      };
      setPrivateEvents((prev) => [newEvent, ...prev]);
      setMemberships((prev) => [...prev, ownerMem]);
      setTasks((prev) => [
        {
          id: makeId('tsk'),
          privateEventId: newEvent.id,
          title: 'Definir lista preliminar de invitados y presupuesto base',
          assigneeName: currentUser.name,
          dueDate: newEvent.eventDate,
          done: false,
        },
        ...prev,
      ]);
      return { ok: true, data: newEvent };
    },
    [currentUser]
  );

  const addProposedBusinessToEvent = useCallback(
    (privateEventId: string, businessId: string): CommandResult => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      setPrivateEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== privateEventId) return ev;
          if (ev.proposedBusinessIds.includes(businessId)) return ev;
          return {
            ...ev,
            proposedBusinessIds: [...ev.proposedBusinessIds, businessId],
          };
        })
      );
      return { ok: true };
    },
    [currentUser]
  );

  const addBudgetItem = useCallback(
    (input: {
      privateEventId: string;
      category: string;
      title: string;
      providerName?: string;
      estimatedPen: number;
      confirmedPen?: number;
    }): CommandResult<BudgetItem> => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      if (!input.title.trim()) {
        return { ok: false, error: 'Ingresa una descripción para el concepto.' };
      }
      const item: BudgetItem = {
        id: makeId('bgt'),
        privateEventId: input.privateEventId,
        category: input.category || 'General',
        title: input.title.trim(),
        providerName: input.providerName?.trim() || undefined,
        estimatedPen: Math.max(0, Number(input.estimatedPen) || 0),
        confirmedPen: Math.max(0, Number(input.confirmedPen) || 0),
        paid: false,
        addedBy: currentUser.name,
      };
      setBudgetItems((prev) => [...prev, item]);
      return { ok: true, data: item };
    },
    [currentUser]
  );

  const toggleBudgetItemPaid = useCallback((itemId: string) => {
    setBudgetItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, paid: !item.paid } : item))
    );
  }, []);

  const addTask = useCallback(
    (input: {
      privateEventId: string;
      title: string;
      assigneeName: string;
      dueDate: string;
    }): CommandResult<TaskItem> => {
      if (!input.title.trim()) {
        return { ok: false, error: 'Describe la tarea pendiente.' };
      }
      const task: TaskItem = {
        id: makeId('tsk'),
        privateEventId: input.privateEventId,
        title: input.title.trim(),
        assigneeName: input.assigneeName.trim() || currentUser?.name || 'Equipo',
        dueDate: input.dueDate || '2026-12-15',
        done: false,
      };
      setTasks((prev) => [...prev, task]);
      return { ok: true, data: task };
    },
    [currentUser]
  );

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  }, []);

  const createInvitation = useCallback(
    (input: {
      privateEventId: string;
      recipientName: string;
      recipientEmail: string;
    }): CommandResult<Invitation> => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      const ev = privateEvents.find((e) => e.id === input.privateEventId);
      if (!ev) return { ok: false, error: 'Evento privado no encontrado.' };
      if (!input.recipientEmail.trim() || !input.recipientEmail.includes('@')) {
        return { ok: false, error: 'Ingresa un correo válido para la invitación.' };
      }
      const token = `inv-${Math.random().toString(36).slice(2, 10)}`;
      const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const inv: Invitation = {
        id: makeId('inv'),
        token,
        privateEventId: ev.id,
        privateEventTitle: ev.title,
        invitedByUserId: currentUser.id,
        invitedByName: currentUser.name,
        recipientEmail: input.recipientEmail.trim().toLowerCase(),
        recipientName: input.recipientName.trim() || input.recipientEmail.trim(),
        role: 'coorganizer',
        status: 'pending',
        expiresAt: exp,
        createdAt: new Date().toISOString(),
      };
      setInvitations((prev) => [inv, ...prev]);
      return { ok: true, data: inv };
    },
    [currentUser, privateEvents]
  );

  const revokeInvitation = useCallback((invitationId: string): CommandResult => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId && inv.status === 'pending'
          ? { ...inv, status: 'revoked' }
          : inv
      )
    );
    return { ok: true };
  }, []);

  const acceptInvitation = useCallback(
    (token: string): CommandResult<{ privateEventId: string }> => {
      if (!currentUser) {
        return { ok: false, error: 'Inicia sesión para aceptar la invitación.' };
      }
      const inv = invitations.find((i) => i.token === token);
      const evaluation = evaluateInvitation(inv, currentUser);
      if (evaluation === 'not_found') {
        return { ok: false, error: 'La invitación no existe o fue eliminada.' };
      }
      if (evaluation === 'revoked') {
        return { ok: false, error: 'Esta invitación fue revocada por el propietario.' };
      }
      if (evaluation === 'expired') {
        return { ok: false, error: 'La invitación ha expirado. Solicita una nueva.' };
      }
      if (evaluation === 'wrong_account') {
        return {
          ok: false,
          error: `Esta invitación pertenece a ${inv?.recipientEmail}. Cambia de cuenta demo para aceptarla.`,
        };
      }
      if (!inv) return { ok: false, error: 'Invitación no encontrada.' };

      if (evaluation === 'already_accepted') {
        return { ok: true, data: { privateEventId: inv.privateEventId } };
      }

      setInvitations((prev) =>
        prev.map((item) =>
          item.id === inv.id ? { ...item, status: 'accepted' } : item
        )
      );
      setMemberships((prev) => {
        const alreadyMember = prev.some(
          (m) => m.privateEventId === inv.privateEventId && m.userId === currentUser.id
        );
        if (alreadyMember) return prev;
        return [
          ...prev,
          {
            id: makeId('mem'),
            privateEventId: inv.privateEventId,
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            role: 'coorganizer',
            joinedAt: new Date().toISOString(),
          },
        ];
      });
      return { ok: true, data: { privateEventId: inv.privateEventId } };
    },
    [currentUser, invitations]
  );

  const createQuoteRequest = useCallback(
    (input: {
      privateEventId: string;
      businessId: string;
      serviceId?: string;
      serviceName: string;
      eventDate: string;
      guestCount: number;
      zone: string;
      estimatedBudgetPen: number;
      message: string;
    }): CommandResult<QuoteRequest> => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      const ev = privateEvents.find((e) => e.id === input.privateEventId);
      const biz = businesses.find((b) => b.id === input.businessId);
      if (!ev || !biz) {
        return { ok: false, error: 'Evento o proveedor no válido.' };
      }
      if (!input.message.trim()) {
        return {
          ok: false,
          error: 'Describe qué necesitas cotizar para que el proveedor pueda responderte.',
        };
      }
      const req: QuoteRequest = {
        id: makeId('req'),
        privateEventId: ev.id,
        privateEventTitle: ev.title,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        businessId: biz.id,
        businessName: biz.name,
        serviceId: input.serviceId,
        serviceName: input.serviceName || 'Servicio personalizado',
        eventDate: input.eventDate || ev.eventDate,
        guestCount: Math.max(1, Number(input.guestCount) || ev.guestCount),
        zone: input.zone || ev.zone,
        estimatedBudgetPen: Math.max(0, Number(input.estimatedBudgetPen) || 0),
        message: input.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setQuoteRequests((prev) => [req, ...prev]);
      setPrivateEvents((prev) =>
        prev.map((item) =>
          item.id === ev.id && !item.proposedBusinessIds.includes(biz.id)
            ? { ...item, proposedBusinessIds: [...item.proposedBusinessIds, biz.id] }
            : item
        )
      );
      setNotifications((prev) => [
        {
          id: makeId('not'),
          userId: biz.ownerId,
          kind: 'quote_request',
          targetId: req.id,
          secondaryId: biz.id,
          title: `Nueva solicitud de ${ev.title}`,
          body: `${req.serviceName} · ${req.guestCount} invitados en ${req.zone}.`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
      return { ok: true, data: req };
    },
    [currentUser, privateEvents, businesses]
  );

  const saveProposalDraft = useCallback(
    (input: {
      requestId: string;
      amountPen: number;
      inclusions: string[];
      exclusions: string[];
      conditions: string;
      expiresAt: string;
    }): CommandResult<Proposal> => {
      const req = quoteRequests.find((r) => r.id === input.requestId);
      if (!req) return { ok: false, error: 'Solicitud no encontrada.' };
      if (req.status === 'declined' || req.status === 'closed') {
        return { ok: false, error: 'La solicitud ya fue cerrada y no admite propuestas.' };
      }
      if (!input.amountPen || input.amountPen <= 0) {
        return { ok: false, error: 'Indica un monto válido en soles (PEN).' };
      }
      const existingDraft = proposals.find(
        (p) => p.requestId === req.id && p.status === 'draft'
      );
      if (existingDraft) {
        const updated: Proposal = {
          ...existingDraft,
          amountPen: Number(input.amountPen),
          inclusions: input.inclusions.filter(Boolean),
          exclusions: input.exclusions.filter(Boolean),
          conditions: input.conditions.trim(),
          expiresAt: input.expiresAt,
        };
        setProposals((prev) =>
          prev.map((p) => (p.id === existingDraft.id ? updated : p))
        );
        return { ok: true, data: updated };
      }
      const newProposal: Proposal = {
        id: makeId('prop'),
        requestId: req.id,
        privateEventId: req.privateEventId,
        businessId: req.businessId,
        businessName: req.businessName,
        amountPen: Number(input.amountPen),
        inclusions: input.inclusions.filter(Boolean),
        exclusions: input.exclusions.filter(Boolean),
        conditions: input.conditions.trim(),
        expiresAt: input.expiresAt,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      setProposals((prev) => [newProposal, ...prev]);
      return { ok: true, data: newProposal };
    },
    [quoteRequests, proposals]
  );

  const sendProposal = useCallback(
    (proposalId: string): CommandResult<Proposal> => {
      const prop = proposals.find((p) => p.id === proposalId);
      if (!prop) return { ok: false, error: 'Borrador de propuesta no encontrado.' };
      const req = quoteRequests.find((r) => r.id === prop.requestId);
      if (!req || req.status === 'declined' || req.status === 'closed') {
        return { ok: false, error: 'La solicitud ya no admite nuevas respuestas.' };
      }
      const sentProp: Proposal = { ...prop, status: 'sent' };
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? sentProp : p)));
      setQuoteRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'responded' } : r))
      );
      setNotifications((prev) => [
        {
          id: makeId('not'),
          userId: req.requesterId,
          kind: 'proposal_received',
          targetId: sentProp.id,
          secondaryId: req.privateEventId,
          title: `Propuesta recibida de ${req.businessName}`,
          body: `Importe S/ ${sentProp.amountPen} para ${req.privateEventTitle}.`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
      return { ok: true, data: sentProp };
    },
    [proposals, quoteRequests]
  );

  const declineQuoteRequest = useCallback(
    (requestId: string, reason: string): CommandResult => {
      const req = quoteRequests.find((r) => r.id === requestId);
      if (!req) return { ok: false, error: 'Solicitud no encontrada.' };
      if (!reason.trim()) {
        return { ok: false, error: 'Indica brevemente por qué no puedes atenderla.' };
      }
      setQuoteRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'declined', declineReason: reason.trim() }
            : r
        )
      );
      return { ok: true };
    },
    [quoteRequests]
  );

  const selectProposal = useCallback(
    (proposalId: string): CommandResult<Proposal> => {
      const prop = proposals.find((p) => p.id === proposalId);
      if (!prop) return { ok: false, error: 'Propuesta no encontrada.' };
      const req = quoteRequests.find((r) => r.id === prop.requestId);
      if (!isProposalActionable(prop, req)) {
        return {
          ok: false,
          error: 'Esta propuesta venció o la solicitud ya fue cerrada.',
        };
      }
      const selected: Proposal = { ...prop, status: 'selected' };
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === prop.id) return selected;
          if (p.requestId === prop.requestId && p.status === 'sent') {
            return { ...p, status: 'rejected' };
          }
          return p;
        })
      );
      setQuoteRequests((prev) =>
        prev.map((r) => (r.id === prop.requestId ? { ...r, status: 'closed' } : r))
      );
      return { ok: true, data: selected };
    },
    [proposals, quoteRequests]
  );

  const saveBusinessDraft = useCallback(
    (input: {
      businessId?: string;
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
      availabilityNote: string;
      submitForReview?: boolean;
    }): CommandResult<Business> => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      if (!input.name.trim() || !input.category.trim() || !input.zone.trim()) {
        return { ok: false, error: 'Completa nombre, categoría y zona del negocio.' };
      }
      if (input.businessId) {
        const existing = businesses.find((b) => b.id === input.businessId);
        if (!existing) return { ok: false, error: 'Negocio no encontrado.' };
        const updated: Business = {
          ...existing,
          name: input.name.trim(),
          category: input.category,
          zone: input.zone,
          coverageZones:
            input.coverageZones.length > 0 ? input.coverageZones : [input.zone],
          summary: input.summary.trim(),
          description: input.description.trim(),
          startingPricePen: input.quoteOnly ? null : input.startingPricePen,
          quoteOnly: input.quoteOnly,
          whatsappPhone: input.whatsappPhone.trim(),
          email: input.email.trim(),
          availabilityNote: input.availabilityNote.trim(),
          contentStatus: input.submitForReview
            ? 'pending'
            : existing.contentStatus === 'observed'
            ? 'draft'
            : existing.contentStatus,
          version: existing.version + 1,
        };
        setBusinesses((prev) =>
          prev.map((b) => (b.id === existing.id ? updated : b))
        );
        return { ok: true, data: updated };
      }
      const created: Business = {
        id: makeId('biz'),
        ownerId: currentUser.id,
        name: input.name.trim(),
        category: input.category,
        zone: input.zone,
        coverageZones:
          input.coverageZones.length > 0 ? input.coverageZones : [input.zone],
        summary: input.summary.trim() || 'Servicios para celebraciones en Lima.',
        description:
          input.description.trim() || 'Ficha de proveedor en preparación.',
        startingPricePen: input.quoteOnly ? null : input.startingPricePen,
        quoteOnly: input.quoteOnly,
        whatsappPhone: input.whatsappPhone.trim() || currentUser.phone,
        email: input.email.trim() || currentUser.email,
        imageUrl: EVENTIN_MEDIA.providerCateringMesa,
        availabilityNote:
          input.availabilityNote.trim() || 'Disponibilidad por confirmar.',
        contentStatus: input.submitForReview ? 'pending' : 'draft',
        paymentStatus: 'unpaid',
        subscriptionActive: false,
        subscriptionPeriodEnd: '2026-12-21',
        version: 1,
        mapX: 45,
        mapY: 55,
      };
      setBusinesses((prev) => [created, ...prev]);
      return { ok: true, data: created };
    },
    [currentUser, businesses]
  );

  const saveService = useCallback(
    (input: {
      businessId: string;
      serviceId?: string;
      name: string;
      description: string;
      pricingMode: 'fixed' | 'quote';
      pricePen: number | null;
      unitLabel: string;
      active: boolean;
    }): CommandResult<Service> => {
      if (!input.name.trim()) {
        return { ok: false, error: 'Ingresa el nombre del servicio.' };
      }
      if (input.serviceId) {
        const existing = services.find(
          (s) => s.id === input.serviceId && s.businessId === input.businessId
        );
        if (!existing) return { ok: false, error: 'Servicio no encontrado.' };
        const updated: Service = {
          ...existing,
          name: input.name.trim(),
          description: input.description.trim(),
          pricingMode: input.pricingMode,
          pricePen: input.pricingMode === 'quote' ? null : input.pricePen,
          unitLabel: input.unitLabel.trim() || 'Servicio',
          active: input.active,
        };
        setServices((prev) =>
          prev.map((s) => (s.id === existing.id ? updated : s))
        );
        return { ok: true, data: updated };
      }
      const created: Service = {
        id: makeId('srv'),
        businessId: input.businessId,
        name: input.name.trim(),
        description: input.description.trim(),
        pricingMode: input.pricingMode,
        pricePen: input.pricingMode === 'quote' ? null : input.pricePen,
        unitLabel: input.unitLabel.trim() || 'Por evento',
        active: input.active,
      };
      setServices((prev) => [...prev, created]);
      return { ok: true, data: created };
    },
    [services]
  );

  const savePublicEventDraft = useCallback(
    (input: {
      publicEventId?: string;
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
      submitForReview?: boolean;
    }): CommandResult<PublicEvent> => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      if (!input.title.trim() || !input.zone.trim()) {
        return { ok: false, error: 'Completa el título y la zona del evento.' };
      }
      if (input.startsAt && input.endsAt && new Date(input.endsAt) < new Date(input.startsAt)) {
        return {
          ok: false,
          error: 'La fecha de término debe ser posterior al inicio.',
        };
      }
      if (input.publicEventId) {
        const existing = publicEvents.find((e) => e.id === input.publicEventId);
        if (!existing) return { ok: false, error: 'Evento público no encontrado.' };
        const updated: PublicEvent = {
          ...existing,
          title: input.title.trim(),
          category: input.category,
          zone: input.zone,
          address: input.address.trim(),
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          entryPricePen: input.isFree ? 0 : Math.max(0, Number(input.entryPricePen) || 0),
          isFree: input.isFree,
          whatsappPhone: input.whatsappPhone.trim(),
          organizerName: input.organizerName.trim() || existing.organizerName,
          summary: input.summary.trim(),
          description: input.description.trim(),
          contentStatus: input.submitForReview ? 'pending' : existing.contentStatus,
          version: existing.version + 1,
        };
        setPublicEvents((prev) =>
          prev.map((e) => (e.id === existing.id ? updated : e))
        );
        return { ok: true, data: updated };
      }
      const created: PublicEvent = {
        id: makeId('evt'),
        ownerId: currentUser.id,
        title: input.title.trim(),
        category: input.category || 'Música y cultura',
        zone: input.zone,
        address: input.address.trim() || `${input.zone}, Lima`,
        startsAt: input.startsAt || '2026-12-26T19:00:00-05:00',
        endsAt: input.endsAt || '2026-12-26T23:00:00-05:00',
        entryPricePen: input.isFree ? 0 : Math.max(0, Number(input.entryPricePen) || 0),
        isFree: input.isFree,
        whatsappPhone: input.whatsappPhone.trim() || currentUser.phone,
        organizerName: input.organizerName.trim() || currentUser.name,
        summary: input.summary.trim() || 'Evento abierto en preparación.',
        description:
          input.description.trim() || 'Detalles completos en revisión antes de publicar.',
        imageUrl: EVENTIN_MEDIA.eventArtisanMarket,
        contentStatus: input.submitForReview ? 'pending' : 'draft',
        paymentStatus: 'unpaid',
        subscriptionActive: false,
        subscriptionPeriodEnd: '2026-12-26',
        version: 1,
        mapX: 50,
        mapY: 50,
      };
      setPublicEvents((prev) => [created, ...prev]);
      return { ok: true, data: created };
    },
    [currentUser, publicEvents]
  );

  const submitPaymentProof = useCallback(
    (input: {
      resourceKind: 'business' | 'public_event';
      resourceId: string;
      proofReference: string;
      proofFileName: string;
      proofNote: string;
      correctionPaymentId?: string;
    }): CommandResult<Payment> => {
      if (!currentUser) return { ok: false, error: 'Sesión requerida.' };
      if (!input.proofReference.trim() || !input.proofFileName.trim()) {
        return {
          ok: false,
          error: 'Adjunta el archivo del comprobante e ingresa el número de operación.',
        };
      }
      const resourceTitle =
        input.resourceKind === 'business'
          ? businesses.find((b) => b.id === input.resourceId)?.name
          : publicEvents.find((e) => e.id === input.resourceId)?.title;

      if (!resourceTitle) {
        return { ok: false, error: 'No se encontró el recurso para este cobro.' };
      }

      if (input.correctionPaymentId) {
        const existingPay = payments.find((p) => p.id === input.correctionPaymentId);
        if (existingPay) {
          const corrected: Payment = {
            ...existingPay,
            proofReference: input.proofReference.trim(),
            proofFileName: input.proofFileName.trim(),
            proofNote: input.proofNote.trim(),
            status: 'proof_received',
            observationReason: undefined,
            submittedAt: new Date().toISOString(),
          };
          setPayments((prev) =>
            prev.map((p) => (p.id === existingPay.id ? corrected : p))
          );
          if (input.resourceKind === 'business') {
            setBusinesses((prev) =>
              prev.map((b) =>
                b.id === input.resourceId
                  ? {
                      ...b,
                      paymentStatus: 'proof_received',
                      contentStatus:
                        b.contentStatus === 'draft' ? 'pending' : b.contentStatus,
                    }
                  : b
              )
            );
          } else {
            setPublicEvents((prev) =>
              prev.map((e) =>
                e.id === input.resourceId
                  ? {
                      ...e,
                      paymentStatus: 'proof_received',
                      contentStatus:
                        e.contentStatus === 'draft' ? 'pending' : e.contentStatus,
                    }
                  : e
              )
            );
          }
          return { ok: true, data: corrected };
        }
      }

      const duplicatePending = payments.find(
        (p) =>
          p.resourceKind === input.resourceKind &&
          p.resourceId === input.resourceId &&
          p.proofReference.toLowerCase() === input.proofReference.trim().toLowerCase()
      );
      if (duplicatePending) {
        return {
          ok: false,
          error:
            'Ya existe un comprobante registrado con esa misma referencia. Verifica el historial para no duplicar envíos.',
        };
      }

      const amountPen = calculatePlanAmountPen(input.resourceKind);
      const newPay: Payment = {
        id: makeId('pay'),
        orderId: `ORD-${input.resourceKind === 'business' ? 'NEG' : 'EVT'}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        resourceKind: input.resourceKind,
        resourceId: input.resourceId,
        resourceTitle,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        amountPen,
        periodLabel: '21 nov 2026 – 21 dic 2026',
        channelLabel: settings.beneficiaryConfigured
          ? settings.beneficiaryChannel
          : 'Comprobante demo (canal pendiente)',
        proofReference: input.proofReference.trim(),
        proofFileName: input.proofFileName.trim(),
        proofNote: input.proofNote.trim(),
        status: 'proof_received',
        submittedAt: new Date().toISOString(),
      };
      setPayments((prev) => [newPay, ...prev]);

      if (input.resourceKind === 'business') {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === input.resourceId
              ? {
                  ...b,
                  paymentStatus: 'proof_received',
                  contentStatus: b.contentStatus === 'draft' ? 'pending' : b.contentStatus,
                }
              : b
          )
        );
      } else {
        setPublicEvents((prev) =>
          prev.map((e) =>
            e.id === input.resourceId
              ? {
                  ...e,
                  paymentStatus: 'proof_received',
                  contentStatus: e.contentStatus === 'draft' ? 'pending' : e.contentStatus,
                }
              : e
          )
        );
      }
      return { ok: true, data: newPay };
    },
    [currentUser, businesses, publicEvents, payments, settings]
  );

  const moderateContent = useCallback(
    (input: {
      resourceKind: 'business' | 'public_event';
      resourceId: string;
      decision: ContentModerationStatus;
      reason: string;
    }): CommandResult => {
      if (!currentUser) return { ok: false, error: 'Sesión administrativa requerida.' };
      if (input.decision !== 'approved' && !input.reason.trim()) {
        return { ok: false, error: 'El motivo es obligatorio para observar, rechazar o suspender.' };
      }

      if (input.resourceKind === 'business') {
        const target = businesses.find((b) => b.id === input.resourceId);
        if (!target) return { ok: false, error: 'Negocio no encontrado.' };
        const prevState = target.contentStatus;
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === target.id
              ? {
                  ...b,
                  contentStatus: input.decision,
                  observationNote:
                    input.decision === 'approved' ? undefined : input.reason.trim(),
                  version: b.version + 1,
                }
              : b
          )
        );
        appendAudit({
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: `moderation.${input.decision}`,
          resourceKind: 'business',
          resourceId: target.id,
          resourceTitle: target.name,
          previousState: prevState,
          newState: input.decision,
          reason: input.reason.trim() || 'Contenido aprobado en revisión.',
        });
      } else {
        const target = publicEvents.find((e) => e.id === input.resourceId);
        if (!target) return { ok: false, error: 'Evento público no encontrado.' };
        const prevState = target.contentStatus;
        setPublicEvents((prev) =>
          prev.map((e) =>
            e.id === target.id
              ? {
                  ...e,
                  contentStatus: input.decision,
                  observationNote:
                    input.decision === 'approved' ? undefined : input.reason.trim(),
                  version: e.version + 1,
                }
              : e
          )
        );
        appendAudit({
          actorId: currentUser.id,
          actorName: currentUser.name,
          action: `moderation.${input.decision}`,
          resourceKind: 'public_event',
          resourceId: target.id,
          resourceTitle: target.title,
          previousState: prevState,
          newState: input.decision,
          reason: input.reason.trim() || 'Contenido aprobado en revisión.',
        });
      }
      return { ok: true };
    },
    [currentUser, businesses, publicEvents, appendAudit]
  );

  const reviewPayment = useCallback(
    (input: {
      paymentId: string;
      decision: 'verified' | 'observed';
      reason: string;
    }): CommandResult => {
      if (!currentUser) return { ok: false, error: 'Sesión administrativa requerida.' };
      const pay = payments.find((p) => p.id === input.paymentId);
      if (!pay) return { ok: false, error: 'Pago no encontrado.' };
      if (input.decision === 'observed' && !input.reason.trim()) {
        return { ok: false, error: 'Ingresa el motivo de observación del comprobante.' };
      }

      const prevState = pay.status;
      setPayments((prev) =>
        prev.map((p) =>
          p.id === pay.id
            ? {
                ...p,
                status: input.decision,
                observationReason:
                  input.decision === 'observed' ? input.reason.trim() : undefined,
                reviewedBy: currentUser.name,
                reviewedAt: new Date().toISOString(),
              }
            : p
        )
      );

      if (pay.resourceKind === 'business') {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === pay.resourceId
              ? {
                  ...b,
                  paymentStatus: input.decision,
                  subscriptionActive: input.decision === 'verified',
                }
              : b
          )
        );
      } else {
        setPublicEvents((prev) =>
          prev.map((e) =>
            e.id === pay.resourceId
              ? {
                  ...e,
                  paymentStatus: input.decision,
                  subscriptionActive: input.decision === 'verified',
                }
              : e
          )
        );
      }

      setSubscriptions((prev) => {
        const exists = prev.some((s) => s.resourceId === pay.resourceId);
        if (!exists) {
          return [
            {
              id: makeId('sub'),
              resourceKind: pay.resourceKind,
              resourceId: pay.resourceId,
              resourceTitle: pay.resourceTitle,
              ownerId: pay.ownerId,
              ownerName: pay.ownerName,
              planAmountPen: pay.amountPen,
              periodStart: '2026-11-21',
              periodEnd: '2026-12-21',
              status: input.decision === 'verified' ? 'active' : 'pending_payment',
              latestPaymentId: pay.id,
            },
            ...prev,
          ];
        }
        return prev.map((s) =>
          s.resourceId === pay.resourceId
            ? {
                ...s,
                status: input.decision === 'verified' ? 'active' : 'pending_payment',
                latestPaymentId: pay.id,
              }
            : s
        );
      });

      appendAudit({
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: input.decision === 'verified' ? 'payment.verify' : 'payment.observe',
        resourceKind: 'payment',
        resourceId: pay.id,
        resourceTitle: `${pay.resourceTitle} · ${pay.orderId}`,
        previousState: prevState,
        newState: input.decision,
        reason: input.reason.trim() || 'Comprobante cotejado en administración.',
      });

      return { ok: true };
    },
    [currentUser, payments, appendAudit]
  );

  const toggleUserSuspension = useCallback(
    (input: { userId: string; suspend: boolean; reason: string }): CommandResult => {
      if (!currentUser) return { ok: false, error: 'Sesión administrativa requerida.' };
      if (input.suspend && !input.reason.trim()) {
        return { ok: false, error: 'El motivo es obligatorio para suspender la cuenta.' };
      }
      const target = users.find((u) => u.id === input.userId);
      if (!target) return { ok: false, error: 'Usuario no encontrado.' };
      const prevState = target.accountStatus;
      const newState = input.suspend ? 'suspended' : 'active';
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.id
            ? {
                ...u,
                accountStatus: newState,
                suspensionReason: input.suspend ? input.reason.trim() : undefined,
              }
            : u
        )
      );
      appendAudit({
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: input.suspend ? 'account.suspend' : 'account.reactivate',
        resourceKind: 'user',
        resourceId: target.id,
        resourceTitle: `${target.name} (${target.email})`,
        previousState: prevState,
        newState,
        reason: input.reason.trim() || 'Reactivación administrativa.',
      });
      return { ok: true };
    },
    [currentUser, users, appendAudit]
  );

  const resolveReport = useCallback(
    (input: {
      reportId: string;
      status: 'resolved' | 'dismissed';
      resolutionNote: string;
      suspendResource?: boolean;
    }): CommandResult => {
      if (!currentUser) return { ok: false, error: 'Sesión administrativa requerida.' };
      const rep = reports.find((r) => r.id === input.reportId);
      if (!rep) return { ok: false, error: 'Reporte no encontrado.' };
      if (!input.resolutionNote.trim()) {
        return { ok: false, error: 'Indica el motivo o detalle de la resolución.' };
      }
      setReports((prev) =>
        prev.map((r) =>
          r.id === rep.id
            ? {
                ...r,
                status: input.status,
                resolutionNote: input.resolutionNote.trim(),
              }
            : r
        )
      );
      if (input.suspendResource) {
        moderateContent({
          resourceKind: rep.resourceKind,
          resourceId: rep.resourceId,
          decision: 'suspended',
          reason: input.resolutionNote.trim(),
        });
      }
      appendAudit({
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'report.resolve',
        resourceKind: 'report',
        resourceId: rep.id,
        resourceTitle: rep.resourceTitle,
        previousState: rep.status,
        newState: input.status,
        reason: input.resolutionNote.trim(),
      });
      return { ok: true };
    },
    [currentUser, reports, moderateContent, appendAudit]
  );

  const updatePlatformSettings = useCallback(
    (next: PlatformSettings): CommandResult => {
      if (!currentUser) return { ok: false, error: 'Sesión administrativa requerida.' };
      setSettings(next);
      appendAudit({
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'settings.update',
        resourceKind: 'settings',
        resourceId: 'platform-billing',
        resourceTitle: 'Tarifas y canales de cobro',
        previousState: settings.beneficiaryConfigured ? 'configured' : 'unconfigured',
        newState: next.beneficiaryConfigured ? 'configured' : 'unconfigured',
        reason: 'Actualización de configuración demostrativa.',
      });
      return { ok: true };
    },
    [currentUser, settings, appendAudit]
  );

  const resetDemoData = useCallback(() => {
    setUsers(DEMO_USERS);
    setCurrentUserId('usr-giovanny');
    setPublicEvents(INITIAL_PUBLIC_EVENTS);
    setBusinesses(INITIAL_BUSINESSES);
    setServices(INITIAL_SERVICES);
    setPrivateEvents(INITIAL_PRIVATE_EVENTS);
    setMemberships(INITIAL_MEMBERSHIPS);
    setBudgetItems(INITIAL_BUDGET_ITEMS);
    setTasks(INITIAL_TASKS);
    setInvitations(INITIAL_INVITATIONS);
    setQuoteRequests(INITIAL_QUOTE_REQUESTS);
    setProposals(INITIAL_PROPOSALS);
    setPayments(INITIAL_PAYMENTS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setReports(INITIAL_REPORTS);
    setAuditLog(INITIAL_AUDIT);
    setNotifications(INITIAL_NOTIFICATIONS);
    setFavorites(INITIAL_FAVORITES);
    setSettings(INITIAL_SETTINGS);
  }, []);

  const value = useMemo<DemoStoreContextValue>(
    () => ({
      users,
      currentUserId,
      currentUser,
      isDemoMode: true,
      publicEvents,
      businesses,
      services,
      privateEvents,
      memberships,
      budgetItems,
      tasks,
      invitations,
      quoteRequests,
      proposals,
      payments,
      subscriptions,
      reports,
      auditLog,
      notifications,
      favorites,
      settings,
      switchDemoUser,
      signInDemo,
      registerDemo,
      signOutDemo,
      toggleFavorite,
      isFavorite,
      markNotificationRead,
      markAllNotificationsRead,
      createPrivateEvent,
      addProposedBusinessToEvent,
      addBudgetItem,
      toggleBudgetItemPaid,
      addTask,
      toggleTask,
      createInvitation,
      revokeInvitation,
      acceptInvitation,
      createQuoteRequest,
      saveProposalDraft,
      sendProposal,
      declineQuoteRequest,
      selectProposal,
      saveBusinessDraft,
      saveService,
      savePublicEventDraft,
      submitPaymentProof,
      moderateContent,
      reviewPayment,
      toggleUserSuspension,
      resolveReport,
      updatePlatformSettings,
      resetDemoData,
    }),
    [
      users,
      currentUserId,
      currentUser,
      publicEvents,
      businesses,
      services,
      privateEvents,
      memberships,
      budgetItems,
      tasks,
      invitations,
      quoteRequests,
      proposals,
      payments,
      subscriptions,
      reports,
      auditLog,
      notifications,
      favorites,
      settings,
      switchDemoUser,
      signInDemo,
      registerDemo,
      signOutDemo,
      toggleFavorite,
      isFavorite,
      markNotificationRead,
      markAllNotificationsRead,
      createPrivateEvent,
      addProposedBusinessToEvent,
      addBudgetItem,
      toggleBudgetItemPaid,
      addTask,
      toggleTask,
      createInvitation,
      revokeInvitation,
      acceptInvitation,
      createQuoteRequest,
      saveProposalDraft,
      sendProposal,
      declineQuoteRequest,
      selectProposal,
      saveBusinessDraft,
      saveService,
      savePublicEventDraft,
      submitPaymentProof,
      moderateContent,
      reviewPayment,
      toggleUserSuspension,
      resolveReport,
      updatePlatformSettings,
      resetDemoData,
    ]
  );

  return (
    <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
  );
};

export function useDemoStore(): DemoStoreContextValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error('useDemoStore debe usarse dentro de DemoStoreProvider.');
  }
  return ctx;
}
