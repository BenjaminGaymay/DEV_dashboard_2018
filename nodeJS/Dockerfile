FROM alpine:3.8

ADD app.js package.json /app/

WORKDIR /app

RUN apk add --update nodejs nodejs-npm && npm install

EXPOSE 3000

CMD ["node", "app.js"]