# syntax=docker/dockerfile:1.5.2
# based on: https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/api/Dockerfile
# and on: https://github.com/vercel/turborepo/discussions/7456#discussioncomment-10468323

ARG BUN_VERSION=1.2.2

ARG YARN_PKG_MANAGER="this.packageManager=\"yarn@1.22.22\""
ARG BUN_PKG_MANAGER="this.packageManager=\"bun@${BUN_VERSION}\""

FROM oven/bun:${BUN_VERSION} as bun
WORKDIR /app

FROM oven/bun:${BUN_VERSION}-alpine as bun-alpine
RUN apk add -f --update --no-cache --virtual .gyp nano bash libc6-compat openssl python3 make g++ \
  && apk del .gyp
WORKDIR /app

#############################################
FROM bun AS pruned
ARG YARN_PKG_MANAGER
COPY . .
RUN bunx json -I -f package.json -e ${YARN_PKG_MANAGER}
# RUN bunx turbo prune --scope="upload" --docker

#############################################
FROM bun as builder
ARG BUN_PKG_MANAGER
COPY --from=pruned /app .
RUN bunx json -I -f package.json -e ${BUN_PKG_MANAGER}
RUN bun install
RUN bunx turbo build --filter="upload"

#############################################
FROM bun-alpine AS release
USER bun
COPY --from=builder /app .
WORKDIR /app
ENTRYPOINT [ "bun", "--filter", "upload", "start"]