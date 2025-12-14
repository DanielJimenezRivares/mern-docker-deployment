FROM node:alpine
WORKDIR /usr/src/backend
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
CMD ["npm", "start"]