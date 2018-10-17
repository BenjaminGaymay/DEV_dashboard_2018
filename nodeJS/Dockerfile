FROM alpine:3.8

ADD app.js db.js package.json about.json .env /app/
ADD routes /app/routes
ADD views /app/views
ADD widgets /app/widgets
ADD public /app/public
ADD views /app/views
ADD routes /app/routes


WORKDIR /app

RUN apk add --update nodejs nodejs-npm python make g++ && npm install --production

EXPOSE 3000

CMD ["node", "app.js"]