# YogaPlatform Legal and IP Playbook

## Purpose

This document defines the minimum legal and intellectual property discipline required to grow YogaPlatform into a premium commercial product without avoidable ownership disputes, licensing conflicts, or compliance gaps.

This is an implementation playbook, not a substitute for advice from a qualified lawyer in the target jurisdictions.

## Current Immediate Risks

### 1. Licensing inconsistency

Current repository materials do not clearly express one consistent licensing posture.

Observed issue:

- README states one licensing story.
- package metadata states another.
- repository-level licensing artifacts are not fully aligned.

Required action:

- Decide whether YogaPlatform is proprietary, source-available, or open source.
- Update all repository metadata to match that decision.

### 2. Asset provenance is not documented

The project uses seeded images, media links, and design assets, but there is no visible source-of-rights register.

Required action:

- Build an asset register covering every third-party visual, font, icon, media file, and external content source.

### 3. Content ownership chain is not formalized

If content, design, development, or brand materials involve collaborators, ownership needs to be contractually assigned.

Required action:

- Use contractor and contributor agreements with IP assignment clauses.

## Legal and IP Model

YogaPlatform should protect five layers of value:

1. Brand.
2. Codebase.
3. Content library.
4. Product methodology and internal know-how.
5. Data and operational materials.

## Layer 1. Brand Protection

Assets to protect:

- Product name.
- Logo.
- Tagline if distinctive.
- Program names if strongly branded.

Actions:

- Run trademark clearance before long-term marketing investment.
- Reserve matching domains and key social handles.
- Create a brand usage policy.
- Avoid descriptive names that are weak and hard to defend.

Repository tasks:

- Add a brand decision log in docs/.
- Keep final product naming consistent across UI, README, and domain strategy.

## Layer 2. Code Ownership

Goal:

- Ensure the company or product owner actually owns the code used in the product.

Actions:

- Every contributor must sign an agreement assigning rights in code, design, and documentation.
- Track use of third-party libraries and their licenses.
- Avoid adding copyleft dependencies unless intentionally approved.

Minimum controls:

- Dependency review checklist.
- License review for each new package.
- Record of who created which internal modules.

## Layer 3. Content Ownership and Usage Rights

Assets covered:

- Course text.
- Program descriptions.
- Blog content.
- Recipes.
- Photos.
- Videos.
- Podcast materials.
- Downloadables.
- Emails.

Actions:

- Keep a content register:
  - asset,
  - creator,
  - date,
  - source,
  - license,
  - assignment status,
  - commercial-use status.
- Distinguish original content from licensed content.
- If using stock media, keep the exact license records.
- If using expert-created materials, confirm assignment or sufficient commercial license.

## Layer 4. Methodology and Trade Secrets

This is one of the most important future-value layers.

Potential trade-secret material:

- Branded program framework.
- Recommendation logic.
- Onboarding decision rules.
- Future AI orchestration prompts and scoring logic.
- Internal editorial system.
- Retention and conversion playbooks.

Actions:

- Document internal methods privately, not in public marketing detail.
- Use NDAs where appropriate.
- Restrict access to sensitive operating documents.
- Keep internal recommendation and personalization logic outside public repo materials when necessary.

## Layer 5. Data and Compliance

YogaPlatform may process personal data and potentially wellness-adjacent data. Even if not regulated as medical data in a given jurisdiction, the product should act conservatively.

Actions:

- Define what user data is collected.
- Define legal basis for collection.
- Add privacy policy that matches actual behavior.
- Add cookie notice if analytics/tracking are used.
- Add medical and wellness disclaimer where needed.
- Add clear retention/deletion handling.

## Required Legal Documents

These should exist before serious paid growth.

### Public-facing documents

- Terms of Service.
- Privacy Policy.
- Cookie Policy if applicable.
- Refund/Cancellation Policy.
- Medical/Wellness Disclaimer.
- Community Guidelines if community features are added.
- Content License / User Content Terms if users can upload or submit material.

### Internal documents

- Contractor IP assignment template.
- NDA template.
- Asset/source register.
- Open-source dependency register.
- Brand/trademark register.
- Content provenance register.

## Open Source and Dependency Policy

YogaPlatform should adopt a lightweight approval policy for dependencies.

Rules:

- Prefer permissive licenses such as MIT, BSD, Apache-2.0 after review.
- Avoid GPL/AGPL dependencies unless intentionally approved with full understanding.
- Keep dependency list and licenses auditable.
- Do not copy code snippets from unknown sources into production without provenance.

## AI and Generated Content Policy

If AI features are introduced later, they must ship with legal guardrails.

Rules:

- Keep track of which outputs are AI-assisted.
- Preserve evidence of human selection, editing, and arrangement for valuable content.
- Do not claim stronger rights than you can actually grant.
- Do not train or fine-tune on content unless you have clear rights to do so.
- Add disclosures and usage restrictions where required.

Recommended fields for provenance records:

- content item id,
- creator type,
- human editor,
- source materials,
- model/vendor used,
- generation date,
- commercial-use status,
- final approval owner.

## Contractor and Expert Agreements

Any designer, developer, instructor, writer, editor, photographer, videographer, or consultant should sign an agreement covering:

- assignment of intellectual property rights,
- confidentiality,
- originality warranty,
- non-infringement warranty,
- right to use name/image/likeness if relevant,
- permitted portfolio use if allowed.

Without this, payment alone may not equal ownership.

## Product Copy and Claims Control

YogaPlatform should avoid legal and reputational risk from overclaims.

Do not claim without evidence:

- medical treatment outcomes,
- therapeutic guarantees,
- certified professional status unless verified,
- exclusive ownership of third-party content,
- AI originality guarantees.

Use safer positioning:

- wellness,
- guidance,
- supportive routines,
- educational content,
- expert-led and curated experiences.

## Repository and Documentation Actions

Priority actions inside the project:

1. Align README, package metadata, and repository licensing posture.
2. Add docs for product roadmap and legal/IP governance.
3. Add policy page placeholders to the app if they do not yet cover actual business operations.
4. Add a private or internal asset register and dependency register.

## Launch Gate Checklist

Before paid acquisition or premium sales, confirm:

- product name cleared for trademark risk,
- repository license policy aligned,
- public legal pages drafted and reviewed,
- refund and cancellation rules defined,
- contributor IP assignments collected,
- third-party assets documented,
- analytics and cookies disclosed if used,
- disclaimers visible where health/wellness claims could be inferred,
- billing terms match actual product behavior.

## 30-60-90 Day Legal/IP Plan

## Days 1-30

- Decide final repository licensing posture.
- Build asset and dependency registers.
- Audit all third-party media in seed data and UI.
- Prepare first-pass Terms, Privacy, and Disclaimer structure.

## Days 31-60

- Introduce contributor and contractor templates.
- Finalize refund/cancellation rules.
- Align all product claims across marketing and UI.
- Define brand naming and trademark shortlist.

## Days 61-90

- Register trademark where commercially justified.
- Add provenance controls for new content.
- Add AI content policy if AI features enter scope.
- Review data retention and deletion process.

## Non-Negotiables

- No commercial launch with contradictory licensing statements.
- No third-party asset use without source tracking.
- No contractor work accepted without written IP terms.
- No premium product claims that exceed actual deliverables.
- No AI feature launch without provenance and policy rules.