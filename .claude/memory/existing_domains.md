---
name: Existing domains
description: Implemented route/domain folders and BullMQ workers
type: project
---

## API Route Domains

Existing `src/routes/api/v1/**` route folders:

- `alerts`
- `archive`
- `attachments`
- `auth`
- `billing`
- `credits`
- `frontend`
- `ideas`
- `ideas-lists`
- `legal-documents`
- `platforms`
- `production-statuses`
- `profiles`
- `referral`
- `scenarios`
- `subscriptions`
- `tariffs`
- `templates`
- `tones`
- `video-durations`
- `video-types`

## Domain Folders

Existing `src/domains/**` folders include route-facing domains plus supporting domains:

- `alerts`, `archive`, `attachments`, `auth`, `billing`, `credits`
- `export-document`, `frontend`, `health`, `ideas`, `ideas-lists`
- `legal-documents`, `mail`, `platforms`, `production-statuses`
- `profiles`, `referral`, `scenarios`, `subscriptions`, `tariffs`
- `templates`, `tones`, `video-durations`, `video-types`

## DB Schema Groups

`src/db/schemas/**` groups:

- `auth`
- `billing`
- `jobs`
- `linking`
- `logs`
- `primary`
- `referral`
- `secondary`

## BullMQ Workers

Existing `src/mq/**` folders:

- `ideas-list-export`
- `ideas-list-generation`
- `mail-send`
- `profiles-from-channels-generation`
- `scenario-chapters-generation`
- `scenario-metadata-generation`
- `scenario-metadata-regeneration`
- `scenario-scene-preview-generation`
- `scenario-scenes-generation`
- `scenario-version-export`

Before creating a new domain or worker, inspect the closest existing implementation and list the references used.
