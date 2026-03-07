# Dependency License Register

This register is a lightweight governance file for third-party packages used in YogaPlatform.

## Review Status Legend

- reviewed
- pending-review
- avoid-for-now

## Core Dependencies

| Package | Purpose | Declared License | Review Status | Notes |
|---|---|---|---|---|
| next | App framework | pending verification | pending-review | Confirm exact upstream license from package metadata or official repo |
| react | UI library | pending verification | pending-review | Confirm during dependency audit |
| react-dom | UI runtime | pending verification | pending-review | Confirm during dependency audit |
| prisma | ORM/tooling | pending verification | pending-review | Review before commercial launch |
| @prisma/client | ORM client | pending verification | pending-review | Review before commercial launch |
| next-auth | Authentication | pending verification | pending-review | Review before commercial launch |
| bcryptjs | Password hashing | pending verification | pending-review | Review before commercial launch |
| bootstrap | UI framework | pending verification | pending-review | Review before brand hardening and distribution |
| bootstrap-icons | Icons | pending verification | pending-review | Review icon redistribution terms |
| cloudinary | Media integration | pending verification | pending-review | Check service and SDK terms |
| resend | Email integration | pending verification | pending-review | Check SDK and service terms |
| zod | Validation | pending verification | pending-review | Review before launch |

## Operating Rules

1. Every new dependency must be reviewed before it becomes part of a release.
2. Avoid strong copyleft licenses unless there is an explicit decision and full impact review.
3. Keep a private evidence trail for reviewed licenses if needed.
4. If a dependency is uncertain, mark it pending-review and do not rely on it for core differentiating IP until verified.