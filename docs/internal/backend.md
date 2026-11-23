# Backend

Valley has no separate API service. The editor (`apps/web`) and the public gallery
(`apps/gallery`) are TanStack Start apps whose server routes and server functions call shared
packages:

| Package           | Owns                                                                         |
| ----------------- | ---------------------------------------------------------------------------- |
| `@valley/db`      | Drizzle schema, Postgres client, SQL migrations in `packages/db/migrations`. |
| `@valley/storage` | The `Storage` interface and its drivers.                                     |
| `@valley/backend` | Projects, uploads, previews, media serving and published-gallery queries.    |

Apps stay thin: a route parses the request, calls `@valley/backend`, and maps the result to its
own types (`apps/web/src/server/projects.server.ts`).

## Media references

Stored documents never hold URLs for uploaded files. An asset's `src` is `store:<key>`, and each
surface resolves it on the way out with `resolveDocument(doc, urlFor)`:

- the editor serves keys from `/api/media/<key>` and turns those URLs back into references on save;
- the live gallery serves `/media/<key>`, or the bucket's `STORAGE_PUBLIC_URL` when set;
- a static export copies every published key to `media/<key>` next to the pages.

## Storage drivers

`STORAGE_DRIVER` picks one; `.env.example` lists each driver's variables.

| Driver   | Backend                                                                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `s3`     | AWS S3 or any S3-compatible service. The default; compose runs SeaweedFS.                                                                                                                                  |
| `r2`     | Cloudflare R2 through its S3 API, with fixed multipart part sizes as R2 requires.                                                                                                                          |
| `local`  | A directory on disk.                                                                                                                                                                                       |
| `immich` | Immich's media folder. Reads any file under it, writes only to `IMMICH_FOLDER`, which can be added to Immich as an external library. Previews land there too, so exclude `**/previews/**` in that library. |

Every driver implements the same `Storage` interface, including a tus `DataStore`, so a finished
upload's id is its storage key. A new driver implements `Storage` and gets a case in
`createStorageFromEnv`.

## Uploads

The editor uploads through tus (`tus-js-client` → `/api/uploads`), resumable and chunked. When an
upload finishes, `@valley/backend` reads the image with sharp, records its oriented size, writes a
WebP preview when the original is large, rotated or not web-friendly, and answers with the asset
the editor inserts. Videos keep the size the browser measured.

## Galleries

`apps/gallery` serves the owner's portfolio at `/` and each public project without a password at
`/<slug>`. Its `/media` route serves only files of those projects. Pages link with plain anchors
and never preload, so the same app prerenders into a static site:

```bash
bun run --cwd apps/gallery export                 # every published gallery, into apps/gallery/dist
bun run --cwd apps/gallery export --slug <slug>   # one gallery at the site root
docker compose run --rm export                    # the same, into ./export
```

The output includes a `vercel.json` and deploys to Vercel or any static host as is.

## Authentication

`apps/web` uses `better-auth` mounted at `/api/auth/$` with Drizzle tables in `@valley/db` (`user`, `session`, `account`, `verification`) and mailer helpers in `@valley/backend`.

- `PUBLIC_URL`: public origin of `apps/web` for auth cookies and links in emails.
- `BETTER_AUTH_SECRET`: session signing secret (32+ bytes, required when `NODE_ENV=production`).
- `VALLEY_SIGNUP_MODE`: `invite` (default) or `open`. The first user on a fresh instance becomes an approved `admin`. In `invite` mode, later sign-ups verify their email and wait on `/pending` until an admin approves them from `/admin/users`. In `open` mode, verified sign-ups are approved automatically.
- `RESEND_API_KEY` & `MAIL_FROM`: sends verification, password-reset, email-change, and approval emails through Resend; when `RESEND_API_KEY` is unset, links are printed to the server log for local development.

To promote an existing user to admin from the CLI:

```bash
bun run --cwd apps/web grant-admin <email>
```

## Local development

```bash
cp .env.example .env
docker compose up -d postgres s3
bun db:migrate
bun run --cwd apps/web seed
bun run dev
```

`docker compose up -d --build` runs the whole stack: migrations, the editor on port 3000
and the gallery on port 3001. `requireAccount` and `requireAdmin` in
`apps/web/src/server/backend.server.ts` enforce active, approved sessions across loaders,
server functions, uploads, and media routes.
