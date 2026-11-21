# Eventin implementation
Work only in gio15041998-blip/Eventin. Never use PruebaCodex.
Read PRODUCT.md, DESIGN.md and docs/navigation/README.md first. Preserve existing green/Manrope identity and navigation contract. Use Spanish UI and PEN pricing. Do not silently replace Supabase with Firebase.
Build React + TypeScript + Vite. Reuse components. Separate route pages, typed domain services and repositories. All routes are proposed, implement and track coverage. No generic page title + placeholder as completion.
Prototype/demo data must be labeled. Real permissions, payments, publication and invitation acceptance belong in backend checks. Never use localStorage or query strings as production authorization. Secrets must stay out of source and frontend.
Before completion run typecheck and build; test critical workflows and review mobile/desktop. Record material missing integrations in IMPLEMENTATION.md. Do not claim production readiness without real backend verification.
