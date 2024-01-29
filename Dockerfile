FROM node:20-alpine

WORKDIR /app

COPY . .

RUN yarn &&\
  yarn build

CMD ["node", "dist/index.js"]

EXPOSE 3000