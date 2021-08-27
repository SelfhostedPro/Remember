FROM node:16-alpine3.13
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY remember.js ./
ENTRYPOINT ["node", "./remember.js"]
CMD [" "]