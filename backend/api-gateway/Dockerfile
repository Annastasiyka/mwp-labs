FROM node:18-alpine
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8800
CMD ["node", "server.js"]