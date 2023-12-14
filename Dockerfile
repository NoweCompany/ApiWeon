FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /home/api

COPY ["package-lock.json", "package.json", "./"]

RUN npm install

COPY . .

EXPOSE 3300

RUN npm run build

CMD [ "npm", "start" ]
