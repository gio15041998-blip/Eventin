# Build Eventin in Google AI Studio
Create a coherent working responsive web app, Spanish (Peru), using all supplied navigation specs. This repository is the sole destination. Do not publish a public deployment or enable billing automatically.

## Visual authority
Figma https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin
Technical map https://www.figma.com/design/LvT99td5UFBvyzpcJkq4Cf/Eventin?node-id=87-1564
Use DESIGN.md and eventin-tokens.css. Manrope, forest green #145C46, ink #172D28, pale #F6F8F7, lime #D7EF98, white surfaces, 12px controls,16px cards, restrained Operate-mode hierarchy. Match established reference instead of generating a different visual identity. Use lucide icons. Real photos already credited in DESIGN.md. No invented ratings or availability; mark seed content illustrative.

## Navigation and implementation
72 canonical routes are in docs/navigation/eventin-navigation.json with 119 transitions and parameters, guards, state, bindings to120Figma frames. Mobile and desktop share routes. Use React Router with history fallback. Each route must have meaningful appropriate content/actions, no generic stub screens. Query params represent filters/panels, never verified payment or privilege. Add recover/reset/authcallback and403/404/invite errors where needed. Preserve filters on back, safe internal returnTo afterlogin, unsaved form confirmation, no mutation on mount. Notifications resolve validated resource IDs, not arbitrary URLs.

## Public experience
Home welcoming user, event planning CTA, events/providers discovery. Explore filters date/category/location/price, distinct tabs. Provider listing/detail, public event detail. Favorites and notifications inheader, not replacing map. Mobile bottomnav Inicio/Explorar/Mapa/Organizar/Perfil; desktop nav consistent.
Map events circle/ticket; providers square/shop icon, filter type/category/area/radius, events date/entry price, providers budget and quote-needed. Manual location search and denied geolocation fallback. Without live map service show explicit illustrative map, never fictional distance as live.

## Account and private planning
Registration/login/recovery via Supabase when configured. In unconfigured demo use an explicitly labeled demo session; no fake authenticated production.
My private events, create/edit form, budget with lineitems and totals, checklist toggle/add tasks, proposed providers, quotes and team. Owner/coorganizer, owner manages invitation/access. Authenticated invitation with expiring revocable token in backend; pending invitation is not membership. Show accepted/pending/expired/revoked. Sharing private event never publishes it. Demo should allow meaningful interactions persisting draft data but not simulate sent email as real.

## Quotes
Client request provider/service/date/guests/location/budget/message; review and confirm before submit, list/detail/status, compare received proposals, selection confirmation. Provider inbox with requestdetail, reply amount/inclusions/exclusions/expiry, review/confirm send or unavailable. Client selecting a proposal creates neither charge nor a contract. Closed/expired requests/proposals cannot be acted on. Implement both actor views linked by data.

## Business
My businesses list/create/edit/detail, services list/new/edit, status/content review and confirmation, provider inbox/reply above. Plan S/30 per business per month, manual checkout/proofupload/received/observed/verified, billing history and renewal. Payment beneficiary not configured: disable real payment instructions and explain configuration is pending. Upload proof != verified payment.

## Public event publisher
My published events shows ALL owned created records including drafts/pending +createbutton. Create/edit title/category/date/time/location/ticketprice/photos/contact, validation, review full draft before submitting, submitted confirmation then status. Plan S/100 per public event permonth, manual proof/history/renewal. Publish only if contentApproved && verifiedCurrentPayment && activePeriod && eventNotEnded. Distinguish private celebration from public listing.

## Admin
Separate protected workspace, overview, content events/businesses queues/detail/approve/observe/reject with reason, paymentsproofreview verify/observe, subscriptions/period/history, users and resourcecapabilities, reports/detail/resolve, audit and settings. Content moderation and payment review are independent permissions. No paid plan grantsadmin. Every mutation records actor,server timestamp, resource,previous/newstate,reason. Prevent self elevation and unauthorized direct URLs in backend. If backend absent clearly segregated demo role switcher only in demo, never real security.

## Architecture, data and tests
Typed entities user, eventMembership,privateEvent,task,budgetItem,business,service,quoteRequest,proposal,publicEvent,payment,subscription,report,audit. Repositories with demo adapter and Supabase adapter. Include SQL migrations with RLS and server/RPC checks for core workflows; never label database work verified without actual running environment.
Load environment config for Supabase URL/public anon key only; service role is serveronly. Keep Gemini optional as assistant; do not require paid API to browse.
Use empty/error/loading/success/disabled states, form validation, accessible labels/focus/dialogs/keyboard, responsive320pxup, reducedmotion. No dead buttons. Use contextual errors.
Run productionbuild/typecheck and tests for visibility predicate, resource access, invitation validity, proposal expiry, price plan and duplicate submits. Review the UI in desktop/mobile. Deliver IMPLEMENTATION.md with per-area coverage and missing credentials/services, no false claims.
