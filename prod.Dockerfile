FROM node:14.17.0-alpine

RUN apk update && apk add --no-cache --virtual .build-deps make gcc g++ python

WORKDIR /app

EXPOSE 3000

COPY package.json .
COPY yarn.lock .

RUN yarn install

RUN apk add --no-cache curl && \
  cd /tmp && curl -Ls https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz | tar xz && \
  cp -R lib lib64 / && \
  cp -R usr/lib/x86_64-linux-gnu /usr/lib && \
  cp -R usr/share /usr/share && \
  cp -R etc/fonts /etc && \
  curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 | tar -jxf - &&\
  cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs && \
  rm -fR phantomjs-2.1.1-linux-x86_64 && \
  apk del curl

# RUN cd node_modules/ \
#   # && rm -r phantomjs-prebuilt \
#   && wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1a/dockerized-phantomjs.tar.gz" | tar xz -C / \
#   && npm config set user 0 \
#   && npm install phantomjs-prebuilt

RUN apk --update add ttf-ubuntu-font-family fontconfig && rm -rf /var/cache/apk/*

# COPY package* ./
RUN yarn autoclean \
  && apk del .build-deps

COPY . .

ENV NODE_ENV=development
RUN yarn build
CMD ["yarn", "start:prod"]
