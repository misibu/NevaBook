# Neva-Book web foundation

## Services

1. **web** — Next.js 16.3.3, public SEO pages + Builder.io Visual CMS + `/create` editor shell.
2. **api** — ASP.NET Core .NET 10, projects, layouts, orders, S3 presigned uploads, n8n webhook.
3. **PostgreSQL** — project/order metadata and editor JSON. Original photos do not live in PostgreSQL.
4. **S3-compatible storage** — originals, previews, rendered production spreads and covers.
5. **n8n** — receives order events and fans them out to Telegram and the selected CRM.

## Print geometry fixed for v1

- Inner production spread: **406 × 206 mm** before trim.
- Finished spread: **400 × 200 mm** after 3 mm trim on outer edges.
- Photo cover: **466 × 246 mm**.
- The editor stores geometry/data; the client never exports production PDFs.

## Builder.io

Set `NEXT_PUBLIC_BUILDER_API_KEY`. Create a **Page** model whose URL targeting matches the real Neva-Book paths. The local home page remains a fallback, so the site can deploy before Builder is connected. Builder can then replace `/` and create content pages without code changes.

## SEO foundation

Public routes use Next.js server rendering and Metadata API. `robots.ts` blocks editor/account/checkout/admin/project URLs and `sitemap.ts` contains indexable landing pages. New product/use-case pages should receive their own URL, title, description, H1, canonical content and internal links.

## Amvera

Use separate Amvera projects for web and API. PostgreSQL and n8n are separate services. Amvera does not use docker-compose for production; each application is deployed from its own Dockerfile/configuration. For this monorepo, the web project builds `web/Dockerfile` and the API project builds `api/Dockerfile`.

Suggested domains:
- `neva-book.ru` → web
- `api.neva-book.ru` → api

## Next implementation slice

- authentication/customer accounts;
- project autosave instead of one-shot create;
- direct S3 photo upload from editor;
- Konva canvas and the existing Neva-Book auto-layout rules;
- immutable order snapshot;
- server-side renderer for 406×206 mm spreads;
- CRM-specific n8n node after CRM is chosen.
