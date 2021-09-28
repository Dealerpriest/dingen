FROM node:lts-alpine
WORKDIR /parse-server
# COPY package*.json ./
COPY . .
RUN npm i
EXPOSE 1337
CMD [ "node", "index.js" ]