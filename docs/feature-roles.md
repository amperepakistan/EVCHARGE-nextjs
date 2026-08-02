# Feature Ownership by Role

Splits `feature.md` across the three CMS-facing roles, based on how the schema
already models them (`vendors`, `terminal_owners`, `users.role IN
('super_admin','staff')`) plus the definitions confirmed on 2026-08-02:

- **Super Admin** — runs the platform itself. Owns every vendor and owner
  account, platform-wide config, security, and cross-tenant analytics.
- **Vendor** — the installer/maintenance partner. Installs terminals for
  terminal owners and is who gets called when there's a hardware problem, so
  they own diagnostics, OCPP, and the physical asset lifecycle. Doc's
  sub-roles (Operator, Station Manager, Technician, Finance, Support Agent)
  are all vendor-side team members — the owner doesn't get sub-roles in
  phase 1.
- **Terminal Owner** — the business/individual hosting the terminal (mall,
  hotel, housing society, fuel station, corporate office). Gets a full
  dashboard login, but field-level visibility is tiered per owner via the
  existing `field_visibility_rules` / `field_visibility_overrides` tables —
  not everything below is visible to every owner by default.

Where a feature applies to more than one role, each role's *scope* is called
out separately (e.g. Super Admin sees the whole network, Vendor sees their
portfolio, Owner sees their own site).

---

## Super Admin

- **§1 Dashboard** — network-wide totals (all chargers, all vendors, all
  owners), full interactive map, cross-network heatmap/clustering.
- **§2 Charger Registration** — oversight/approval of registrations vendors
  create; owns the platform-wide charger ID namespace.
- **§2 OCPP Management** — platform infrastructure layer (boot notification,
  firmware, config, resets) — technical, not owner-facing.
- **§3/§4 Health & Fault Management** — platform-wide fault/health trend
  visibility for SLA oversight across all vendors (not per-device diagnostics
  — that's Vendor's job, see below).
- **§6 Pricing Engine** — defines the platform's pricing *models* (flat,
  time-based, hybrid, dynamic, membership/fleet/corporate templates) that
  vendors then apply.
- **§7 Revenue Management** — full platform revenue: per operator, per city,
  per station, tax reports, platform-wide exports.
- **§8 User Management** — creates/manages every vendor and owner account,
  platform-wide RBAC, audit logs, session history for everyone. Also the one
  who configures each owner's field-visibility tier.
- **§9 Fleet Management** — enables/oversees fleet features as a platform
  capability (Vendor sells it, Super Admin provisions it).
- **§17 Smart Energy Management** — grid-level load balancing, transformer
  protection, power scheduling across sites.
- **§19 AI Analytics** — cross-tenant models (demand prediction, revenue
  forecasting, fraud detection, customer behavior) — needs platform-wide data
  Vendor/Owner don't have.
- **§20 Reports** — all report types, all tenants, custom reports.
- **§23 Multi-Tenant SaaS** — exclusively Super Admin: tenant branding,
  domains, pricing templates, permissions, single backend administration.
- **§24 API Platform** — owns API keys/webhooks at the platform level.
- **§25 Security** — JWT/2FA policy, IP restrictions, backups, disaster
  recovery — platform config (though 2FA itself protects every role's login).
- **§26 Compliance** — OCPP/OCPI/OpenADR/MID/ISO 15118 conformance — platform
  infrastructure, not a dashboard feature any tenant touches directly.

---

## Vendor

- **§1 Dashboard** — scoped to their own portfolio: their chargers'
  online/offline/faulted counts, sessions in progress, map of *their*
  installs, usage heatmap for planning maintenance visits.
- **§2 Charger Registration** — the actual doer: register charger, assign
  charger ID/station, QR code generation, RFID assignment (they're the ones
  on-site installing).
- **§2 Remote Operations** — start/stop/reset/lock/unlock/enable/disable,
  emergency shutdown — this is their maintenance authority over hardware they
  installed.
- **§2 OCPP Management** — day-to-day technical operation of chargers they
  service (heartbeat, meter values, firmware, remote diagnostics).
- **§3 Charger Health Monitoring** — this is the core reason Vendor exists in
  your model: real-time health (temp, voltage, current, fan/door/contactor
  status), health score, predictive maintenance alerts.
- **§4 Fault Management** — receives live alerts, creates maintenance
  tickets, assigns their own technicians.
- **§5 Station Management (maintenance history)** — logs service visits
  against a station.
- **§6 Pricing Engine** — applies/adjusts pricing on their chargers within
  whatever template Super Admin defines.
- **§7 Revenue Management** — revenue per charger/station they operate,
  invoice generation for their own contracts.
- **§8 User Management (sub-roles)** — manages their own team: Operator,
  Station Manager, Technician, Finance, Support Agent — invites/removes
  people, sets their permissions within the vendor account.
- **§9 Fleet Management** — sells/administers fleet contracts (register
  companies, assign RFID, department-wise billing) as a B2B service.
- **§10 Reservation Management** — configures reservation rules/expiry for
  chargers they maintain.
- **§11 Notifications** — fault detected, maintenance due, firmware
  available, offline charger — all about their hardware.
- **§16 Solar Integration** — if they also install/maintain on-site solar
  hardware, operational management of that equipment.
- **§18 Analytics Dashboard** — performance/failure trends for their
  portfolio.
- **§19 AI Analytics** — failure prediction, recommended maintenance (feeds
  directly off their diagnostics data).
- **§20 Reports** — maintenance, fault, and energy reports for chargers they
  service.
- **§21 Maintenance Module** — entirely theirs: scheduling, technician
  assignment, inventory, parts, warranty tracking, inspection checklists.
- **§22 Asset Management** — chargers, power modules, connectors,
  transformers, solar panels, batteries — the physical assets they install
  and lifecycle-track.

---

## Terminal Owner

- **§1 Dashboard** — scoped to their own site(s): available/occupied status,
  daily revenue (their share), daily energy delivered, active users at their
  location. Not a network map — just their site(s).
- **§5 Station Management (descriptive info)** — this is their business
  listing: images, amenities, working hours, GPS location. They maintain
  this because it's their property.
- **§6 Pricing Engine** — view-only by default (pricing is set by
  Vendor/Super Admin per the revenue-share agreement) unless you decide to
  let specific owners negotiate their own rate — flagged below as open.
- **§7 Revenue Management** — their site's revenue/revenue-share — this is
  the core commercial reason an owner logs in at all.
- **§9 Fleet Management** — relevant only for owner types that are
  corporate offices/housing societies wanting internal chargeback for their
  own tenants' vehicles — not a general owner feature.
- **§10 Reservation Management** — reservations at their site, no-show
  detection.
- **§11 Notifications** — charging started/completed at their site, revenue
  summary, weekly reports.
- **§12 CCTV Integration** — this is security for their physical premises;
  they own the camera relationship, live view, and recordings.
- **§13 ANPR** — parking/access management at their site (whitelist,
  blacklist, unauthorized-parking detection) — feeds the `leads` table
  (`source='anpr'`) into their leads-count visibility field.
- **§14 Smart Parking Management** — occupancy, overstay detection, parking
  fees, queue monitoring at their site.
- **§15 Access Control** — barrier gates, RFID/QR/PIN/employee/visitor
  access to their property.
- **§16 Solar Integration (savings view)** — sees generation/usage/savings
  data even if Vendor operates the hardware.
- **§18 Analytics Dashboard** — their site's peak usage, popular-times,
  average session duration.
- **§20 Reports** — revenue and energy reports for their own site.

---

## Open questions / assumptions I made a call on

1. **Pricing control** — I assumed owners get view-only pricing, with
   Vendor/Super Admin setting rates. If some owners should be able to set
   their own pricing (e.g. a housing society running its own tariff), that
   changes §6's split.
2. **Remote start/stop for owners** — I kept this Vendor-only (maintenance
   authority). If an owner should be able to eject a stuck session at their
   own site without calling the vendor, that's a small addition to Owner.
3. **RFID/Access Control overlap** — RFID is both a charging-auth method
   (Vendor/Charger Management) and a site-access method (Owner/Access
   Control). Listed both places; worth deciding who actually issues RFID
   cards operationally.
4. **Asset ownership vs. Vendor asset management** — §22 assumes Vendor owns
   the equipment lifecycle even when it's installed on Owner property. If
   owners sometimes purchase the hardware outright (rather than a
   vendor-owned/leased model), Asset Management should show up under Owner
   too, at least as a read-only asset list.
5. **Owner visibility tiers** — you mentioned wanting tiers of visibility for
   owners; the schema's `field_visibility_rules`/`field_visibility_overrides`
   already supports per-field toggles (`revenue`, `uptime_pct`,
   `leads_count`, etc.) and per-entity overrides. Worth confirming that's
   the mechanism you want to build tiering on top of, rather than something
   new.
