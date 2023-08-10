FROM node:16.20.1-alpine3.18

RUN apk update && \
apk add --no-cache bash && \
rm -rf /var/cache/apk/*

RUN mkdir -p /mnt/external/node_modules /mnt/external/yarn/.cache

COPY . /app
WORKDIR /app
CMD yarn start ./test -d false -p 8080 --no-dotfiles
