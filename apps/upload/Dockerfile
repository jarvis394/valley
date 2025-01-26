# syntax=docker/dockerfile:1.5.2
# based on: https://github.com/vercel/turbo/blob/main/examples/with-docker/apps/api/Dockerfile

FROM node:22-alpine as base

# adding apk deps to avoid node-gyp related errors and some other stuff. adds turborepo globally
RUN apk add -f --update --no-cache --virtual .gyp nano bash libc6-compat openssl python3 make g++ \
  && npm i -g turbo \
  && apk del .gyp

#############################################
FROM base AS pruned
WORKDIR /app

COPY . .

# see https://turbo.build/repo/docs/reference/command-line-reference#turbo-prune---scopetarget
RUN turbo prune --scope=upload --docker

#############################################
FROM base AS installer
WORKDIR /app

COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock /app/yarn.lock

# Forces the layer to recreate if the app's package.json changes
COPY apps/upload/package.json /app/apps/upload/package.json

# see https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/reference.md#run---mounttypecache
RUN \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
  yarn --prefer-offline --frozen-lockfile

# fixing sharp dependency to be installed in our alpine image
RUN \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
  yarn -W add sharp --ignore-engines --force

COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --no-cache --filter=upload

# re-running yarn ensures that dependencies between workspaces are linked correctly
RUN \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
  yarn --prefer-offline --frozen-lockfile

# fixing sharp dependency to be installed in our alpine image
RUN \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
  yarn -W add sharp --ignore-engines --force

#############################################
FROM base AS runner
WORKDIR /app

ENV HOST=0.0.0.0

COPY --from=installer /app .

ENTRYPOINT ["yarn", "workspace", "upload", "start"]
