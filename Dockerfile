FROM node:alpine

WORKDIR /var/www

COPY package.json .

COPY index.js .

RUN npm install

CMD ["npm", "start"]
