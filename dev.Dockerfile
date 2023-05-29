FROM node:14.17.0-alpine

RUN apk update && apk add --no-cache --virtual .build-deps make gcc g++ python

WORKDIR /app

EXPOSE 3000

COPY package.json .
COPY yarn.lock .

RUN yarn install

# COPY package* ./
RUN yarn autoclean \
    && apk del .build-deps

COPY . .

ENV NODE_ENV=development
CMD ["yarn", "start:dev"]
