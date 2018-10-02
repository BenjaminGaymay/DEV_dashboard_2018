# https://hub.docker.com/r/mhart/alpine-node/

FROM mhart/alpine-node:10

ADD . /app

EXPOSE 3000

WORKDIR /app

RUN npm install

CMD ["node", "app.js"]