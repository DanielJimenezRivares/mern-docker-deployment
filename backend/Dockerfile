FROM node:alpine
WORKDIR /usr/src/backend
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]