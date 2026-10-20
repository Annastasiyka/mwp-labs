FROM node:20-alpine
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8801
CMD [ "node", "server.js" ]