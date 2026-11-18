# One image per app, built from the monorepo. docker-compose.yml picks the target.
FROM oven/bun:1.3.14 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY apps/gallery/package.json apps/gallery/
COPY packages/backend/package.json packages/backend/
COPY packages/canvas/package.json packages/canvas/
COPY packages/db/package.json packages/db/
COPY packages/storage/package.json packages/storage/
COPY packages/ui/package.json packages/ui/
COPY oxlint-plugin-valley/package.json oxlint-plugin-valley/
RUN bun install --frozen-lockfile

FROM deps AS source
COPY . .

FROM source AS build-web
# Inlined into the client bundle, so it is fixed at build time.
ARG GALLERY_SERVICE_URL=http://localhost:3001
ENV GALLERY_SERVICE_URL=$GALLERY_SERVICE_URL
RUN cd apps/web && bun --bun run build

FROM source AS build-gallery
RUN cd apps/gallery && bun --bun run build

FROM deps AS migrate
COPY packages/db ./packages/db
CMD ["bun", "packages/db/src/migrate.ts"]

FROM oven/bun:1.3.14-slim AS web
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build-web /app/apps/web/.output ./.output
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]

FROM oven/bun:1.3.14-slim AS gallery
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build-gallery /app/apps/gallery/.output ./.output
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
