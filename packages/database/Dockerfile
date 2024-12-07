FROM node:22-alpine

RUN apk update && apk add --no-cache openssl

WORKDIR /app

COPY ./yarn.lock ./yarn.lock
COPY ./package.json ./package.json
COPY ./packages ./packages

# see https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/reference.md#run---mounttypecache
RUN \
  --mount=type=cache,target=/usr/local/share/.cache/yarn/v6,sharing=locked \
  yarn --prefer-offline --frozen-lockfile

CMD yarn workspace @valley/db db:deploy
