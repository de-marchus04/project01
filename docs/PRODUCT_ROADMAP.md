# YogaPlatform Product Roadmap

## Product Direction

YogaPlatform should evolve from a content-first yoga storefront into a premium wellness membership platform with recurring revenue, guided outcomes, and defensible brand/IP assets.

Target positioning:

- Premium digital wellness ecosystem for stress recovery, mindful movement, feminine balance, healthy back, and sustainable routines.
- Core business model: recurring membership.
- Secondary monetization: consultations, flagship programs, retreats, and later B2B wellness packages.

Core promise:

- The product should not just sell classes. It should deliver a structured personal wellness path.

## Strategic Goals

1. Move revenue dependence away from one-off course sales toward membership retention.
2. Build a recognizable authorial methodology that is harder to commoditize.
3. Introduce personalization and guided journeys before adding decorative AI.
4. Create a premium upsell ladder from membership to consultations and retreats.
5. Keep legal, brand, and IP hygiene aligned with future commercialization.

## Product Pillars

### 1. Membership Core

- Content library with access tiers.
- Ongoing member value every week.
- Progress, streaks, saved plans, personal dashboard.

### 2. Guided Programs

- Outcome-based journeys instead of isolated content pages.
- Examples: 14-day healthy back reset, 21-day anti-stress flow, 28-day feminine balance.

### 3. Expert Layer

- Consultations, mentor packages, premium live sessions, retreat access.

### 4. Personalization Layer

- Goal-based onboarding.
- Recommendations by goal, level, time budget, and contraindications.

### 5. Brand and IP Layer

- Branded methodology.
- Own design language, own program naming system, own templates and editorial system.

## Roadmap

## Phase 0. Foundation and Risk Cleanup

Goal:

- Remove structural contradictions before scaling product and sales.

Deliverables:

- Align repository licensing across README, package metadata, and actual distribution policy.
- Decide whether the codebase is proprietary, source-available, or open source.
- Add a product decision log and implementation backlog.
- Audit third-party assets: photos, icons, fonts, videos, audio, illustrations.
- Inventory all current content sources seeded into the database.

Implementation areas:

- README.md
- package.json
- docs/
- public/
- prisma/seed.ts

Acceptance criteria:

- One clear licensing position.
- No mismatch between public statements and actual repository setup.
- Basic asset/source register exists.

## Phase 1. Repositioning and Information Architecture

Goal:

- Reframe YogaPlatform as a membership-first premium product.

Deliverables:

- New site messaging: membership first, courses second, consultations and retreats as premium extensions.
- Revised homepage sections around outcomes, rituals, guided paths, and premium trust.
- New navigation structure with explicit membership entry point.
- Draft pricing model: Membership, Premium, Signature.
- Product taxonomy: rituals, journeys, library, expert sessions, retreats.

Suggested pricing model:

- Membership: access to core library, routines, meditations, recipes, community features.
- Premium: all membership content plus guided plans, premium live sessions, deeper personalization.
- Signature: premium plus priority consultations, private group access, retreat benefits.

Implementation areas:

- src/app/page.tsx
- src/widgets/home/
- src/app/courses/
- src/app/consultations/
- src/app/tours/

Acceptance criteria:

- Homepage no longer reads like a course catalog.
- Pricing and navigation clearly communicate ongoing value.

## Phase 2. Membership Core

Goal:

- Introduce the recurring product layer that makes subscriptions rational.

Deliverables:

- Membership plans in the domain model.
- Gated content and access checks.
- Member dashboard with:
  - weekly plan,
  - recommended sessions,
  - saved items,
  - streak/progress widget.
- Simple onboarding capturing:
  - primary goal,
  - level,
  - available time,
  - constraints,
  - preferred format.
- Recommended content feed driven by onboarding data.

Schema candidates:

- MembershipPlan
- UserMembership
- UserGoalProfile
- Program
- ProgramModule
- UserProgramProgress

Implementation areas:

- prisma/schema.prisma
- auth and profile flows
- src/app/profile/
- new src/app/membership/
- new access-control utilities

Acceptance criteria:

- A registered user can have a membership state.
- Content visibility varies by plan.
- Dashboard reflects ongoing personal value, not just past purchases.

## Phase 3. Guided Programs and Retention Loops

Goal:

- Increase retention through structured outcomes.

Deliverables:

- Flagship guided programs.
- Daily and weekly progress tracking.
- Saved routines and continue-where-you-left-off experience.
- Email touchpoints: welcome, weekly plan, re-engagement.
- Challenge mechanics: streaks, milestones, completion badges.

Flagship program recommendations:

- 14-day healthy back reset.
- 21-day anti-stress flow.
- 28-day feminine balance.
- 10-minute morning reset for busy professionals.

Implementation areas:

- prisma/schema.prisma
- src/app/profile/
- src/app/programs/
- email/send flows
- widgets for streaks and progress

Acceptance criteria:

- At least two full guided journeys are usable end-to-end.
- Users can see progress and next actions.

## Phase 4. Premium Layer and High-Ticket Upsells

Goal:

- Make higher pricing defensible.

Deliverables:

- Premium consultations flow.
- Signature plan or concierge-style premium tier.
- Priority booking for retreats.
- Live session calendar and replay library.
- Premium editorial collections curated by experts.

Implementation areas:

- consultations pages
- tours pages
- profile/dashboard
- booking and request flows

Acceptance criteria:

- Upsell path exists from membership to expert services.
- Premium tier has concrete value beyond access volume.

## Phase 5. Personalization and AI Layer

Goal:

- Add defensible intelligence only after the membership core exists.

Deliverables:

- Recommendation engine based on user goal profile and behavior.
- Wellness assistant constrained by YogaPlatform's own methodology.
- Session recommendations by mood, energy, available time, and focus area.
- Content summaries and guided next-step prompts.

Important rule:

- AI should support a proprietary method, not replace product strategy.

Acceptance criteria:

- Recommendations feel product-specific, not generic.
- AI output is grounded in internal content taxonomy and brand rules.

## Phase 6. Operations, Analytics, and B2B Readiness

Goal:

- Prepare the product for scale and monetization maturity.

Deliverables:

- Analytics for activation, retention, churn, program completion, consultation conversion.
- CRM-light tracking for leads from memberships into consultations and retreats.
- Admin tools for program management and featured collections.
- Optional future workstream: corporate wellness packages.

## Execution Order

Recommended order of delivery:

1. Foundation and licensing cleanup.
2. Repositioning and information architecture.
3. Membership domain model and gated access.
4. Member dashboard and onboarding.
5. Guided programs.
6. Premium upsells.
7. AI/personalization layer.
8. B2B extensions.

## Immediate 30-60-90 Day Plan

## Days 1-30

- Finalize positioning and plan structure.
- Align licensing and repository policy.
- Define membership tiers.
- Design updated homepage and pricing architecture.
- Add missing legal documents and policy skeletons.

## Days 31-60

- Add membership entities to Prisma.
- Implement gated access and user membership state.
- Build onboarding form and member dashboard shell.
- Launch first flagship guided program.

## Days 61-90

- Add second and third guided programs.
- Add premium conversion paths for consultations and retreats.
- Add retention emails and progress widgets.
- Start recommendation engine and method-constrained assistant design.

## Technical Backlog Priorities

### Priority A

- Membership entities and access control.
- Pricing page.
- Dashboard redesign.
- Policy pages and repository licensing alignment.

### Priority B

- Guided program domain.
- Email flows.
- Admin tools for featured programs.

### Priority C

- Recommendations.
- AI assistant.
- B2B packaging.

## Success Metrics

- Visitor to registration conversion.
- Registration to membership activation.
- 30-day retention.
- Guided program completion rate.
- Membership to consultation conversion.
- Membership to retreat lead conversion.
- Average revenue per member.

## Non-Negotiables

- No feature should be shipped if it weakens brand clarity.
- No external content or assets should be added without source and license tracking.
- No AI feature should launch without guardrails, disclaimers, and provenance rules.
- Product messaging, legal wording, and repository licensing must stay consistent.