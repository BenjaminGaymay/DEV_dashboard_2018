FROM alpine:3.8

ADD ./src/app.js package.json ./src/about.json /app/
ADD ./src/routes /app/routes
ADD ./src/views /app/views

WORKDIR /app

RUN apk add --update nodejs nodejs-npm && npm install

EXPOSE 3000

CMD ["node", "app.js"]