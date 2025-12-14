FROM node:alpine AS build
WORKDIR /usr/src/frontend
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE=/api
RUN npm run build

FROM nginx:alpine
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && apk add --no-cache gettext
COPY --from=build /usr/src/frontend/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]