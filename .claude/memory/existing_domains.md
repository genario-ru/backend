---
name: Existing domains
description: All implemented API domains with route/schema locations, and all BullMQ workers
type: project
---

## API domains (`src/routes/api/v1/` + `src/domains/`)

| Domain            | Notes                                                  |
| ----------------- | ------------------------------------------------------ |
| `archive`         | Read-only archive of generated content                 |
| `attachments`     | Pre-signed S3 download URLs                            |
| `billing`         | Payments, payment-methods, webhook (Tochka + YooKassa) |
| `credits`         | Packages, batches, usage, initiate payment             |
| `ideas`           | Single idea CRUD + save                                |
| `ideas-lists`     | Full CRUD + AI generation + export                     |
| `platforms`       | Reference data                                         |
| `profiles`        | YouTube/platform profiles — full CRUD                  |
| `referral`        | Referral codes and rewards                             |
| `scenarios`       | Main product — full CRUD + chapters + scenes + export  |
| `subscriptions`   | Current user subscription status                       |
| `tariffs`         | Available subscription plans                           |
| `templates`       | Scenario templates                                     |
| `tones`           | Writing tone options                                   |
| `users`           | Current user profile management                        |
| `video-durations` | Reference data                                         |
| `video-types`     | Reference data                                         |

## Auth routes (`src/routes/api/auth/`)

Better Auth — session, sign-in, sign-out, OTP verification.

## BullMQ workers (`src/mq/`)

| Folder                              | Job                                  |
| ----------------------------------- | ------------------------------------ |
| `ideas-list-export`                 | Export ideas list to document        |
| `ideas-list-generation`             | AI generation of ideas               |
| `profiles-from-channels-generation` | Build profiles from YouTube channels |
| `scenario-chapters-generation`      | AI generation of scenario chapters   |
| `scenario-scene-preview-generation` | Generate scene preview images        |
| `scenario-scenes-generation`        | AI generation of scenario scenes     |
| `scenario-version-export`           | Export scenario version to document  |

Before creating a new domain or worker, check this list and read the most similar existing implementation as reference.
