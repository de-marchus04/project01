# Asset Register

Use this register for every third-party or externally sourced asset before commercial launch.

## Status Legend

- pending-review
- approved-commercial-use
- restricted
- replace-before-launch

## Asset Table

| Asset | Location | Source | Creator/Provider | License/Terms | Commercial Use Confirmed | Owner/Editor | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Hero background image | src/widgets/home/ui/Hero.tsx | Unsplash URL | Unknown yet | Pending verification | No | TBD | pending-review | Replace with owned or fully documented asset before launch |
| Platform cards imagery | src/widgets/home/ui/PlatformSections.tsx | Unsplash URLs | Unknown yet | Pending verification | No | TBD | pending-review | Audit every linked image individually |
| Seeded course images | prisma/seed.ts | Unsplash URLs | Unknown yet | Pending verification | No | TBD | pending-review | Review rights and preserve exact source references |
| Seeded consultation images | prisma/seed.ts | Unsplash URLs | Unknown yet | Pending verification | No | TBD | pending-review | Review before paid launch |
| Seeded retreat images | prisma/seed.ts | Unsplash URLs | Unknown yet | Pending verification | No | TBD | pending-review | Replace with owned assets if needed |
| Blog/article images | prisma/seed.ts | Unsplash URLs | Unknown yet | Pending verification | No | TBD | pending-review | Track per item, not as a bundle |
| Bootstrap Icons | package.json | npm | bootstrap-icons | Check package terms | Pending | TBD | pending-review | Verify attribution requirements if any |

## Operating Rules

1. No asset is considered launch-safe until its source and rights are documented.
2. Seed/demo assets must be reviewed separately from production assets.
3. Store exact links, invoice records, license screenshots, or agreement references outside the public repo if necessary.
4. If an asset cannot be verified, replace it.