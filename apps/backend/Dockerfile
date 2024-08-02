FROM node:20-alpine

RUN apk update && apk add --no-cache openssl

RUN yarn add sharp --ignore-engines

WORKDIR /app

CMD yarn prisma:migrate ; VIPS_CONCURRENCY=$(nproc) yarn dev:backend
