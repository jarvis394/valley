FROM node:20-alpine

RUN apk update && apk add --no-cache openssl

WORKDIR /app

RUN yarn

CMD ["yarn", "dev:frontend"]
